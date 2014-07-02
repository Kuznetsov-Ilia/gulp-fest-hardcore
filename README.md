gulp-fest-hardcore
==================
Fest — это шаблонизатор общего назначения, компилирующий XML шаблоны в самодостаточные JavaScript функции. Для установки требуется Node.js >= 0.8.
![alt text](http://24.media.tumblr.com/0fc9023daa303558d036ecd63fd2c24e/tumblr_mjedslIPPH1qbyxr0o1_500.gif "My fest")
### кастрированная версия
* **нет try-cache** - надо оборачивать саму ф-ю вызова
* нет неймспейса fest
* нет контекста, внутри шаблона есть только params
* выпилины конструкции:
  - `template` - контексты убраны
  - `text` - нецелесообразен
  - `element` - полигон для усложнений
  - `attributes` - нецелесообразен
  - `attribute` - нецелесообразен
  - `each` - заменён на `for`
  - `choose` - заменён на `switch`
  - `when` - заменён на `case`
  - `otherwise` - заменён на `default`
  - `script` - полигон для усложнений, номинально присутствует
  - `var` - заменен на `vars`

* изменены параметры и значения по умолчанию
  - `value` _output_ -> _escape_ по умолчанию **text**, вместо html
  - `for` _from="1" to="5"_ **выпилено**

* добавлены
  + `for` _in_ <- `each`
  + `switch` <- `choose`
  + `case` <- `when`
  + `default` <- `otherwise`
  + `vars` <- `var`

* нада быть внимательным: формируемый шаблон условно делится на выражения и возвращаемое значения.
```xml
<!--antipatern-->
<value>
  (params.c = params.a + params.b, params.c)
</value>
<if test="params.c">
  fail
</if>
<!--
module.exports = function (params) {
  var __expr0__ = "";
  if (params.c) {
    __expr0__ = "fail"
  }
  return ((params.c = params.a + params.b, params.c)) + __expr0__
}
-->
```

```xml
<!--patern-->
<script>
params.d = params.a - params.b
</script>
<if test="params.d">
  good
</if>
<!--
module.exports = function (params) {
  params.d = params.a - params.b;
  var __expr1__ = "";
  if (params.d) {
    __expr1__ = "good"
  }
  return __expr1__
}
-->
```



## Установка

```
npm install gulp-fest-hardcore
```

## Введение

Шаблоны представляют собой псевдо XML документы, содержащие HTML, текстовые данные и управляющие конструкции.

```xml
  Hello, <value>params.name</value>!
```

_Замечание: начальные и конечные пробелы в текстовых узлах удаляются при компиляции. Если необходимо вывести символ пробела, можно вопспользоваться `<space />`._

## Данные и вывод

### value

Служит для вывода значения JavaScript выражения. Поддерживаем 4 режима вывода: text (по умолчанию), html, js и json.
Использует глобальные функции: `$.escapeHTML(value)`, `$.escapeJS(value)` - их следует определить самостоятельно,
или использовать следующие:

```js
$.escapeHTML = function (s) {
  if (typeof s === 'string') {
    if (/[&<>"]/.test(s)) {
      return s.replace(/[&<>"]/g, function(chr) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '\"': '&quot;'
        }[chr]
      });
    }
  } else if (typeof s === 'undefined') {
    return '';
  }
  return s;
}

$.escapeJS = function (s) {
  if (typeof s==="string") {
    if (/[\\'"\/\n\r\t\b\f<>]/g.test(s)) {
      return s.replace(/[\\'"\/\n\r\t\b\f<>]/g, function (chr){
        return {
          '"': '\"',
          '\\': '\\',
          '/' : '\\/',
          '\n': '\\n',
          '\r': '\\r',
          '\t': '\\t',
          '\b': '\\b',
          '\f': '\\f',
          '\'' : '\\\'',
          '<' : '\\u003C',
          '>' : '\\u003E'
        }[chr];
      });
    }
  } else if (typeof s==="undefined") {
    return "";
  }
  return s;
}

$.extend = function (original, extended) {
  extended = extended || {};
  for (var key in extended) {
    original[key] = extended[key];
  }
  return original;
}
```
```lua
return {
  escapeHTML = function (s)
    if s == nil then return '' end
    local esc, i = s:gsub('&', '&amp;')
                    :gsub('<', '&lt;')
                    :gsub('>', '&gt;')
                    :gsub('\"', '&quot;')
    return esc
  end,
  escapeJS = function (s)
    if s == nil then return '' end
    local esc, i = s:gsub('"', '\"')
                    :gsub('\\', '\\')
                    :gsub('/' , '\\/')
                    :gsub('\n', '\\n')
                    :gsub('\r', '\\r')
                    :gsub('\t', '\\t')
                    :gsub('\b', '\\b')
                    :gsub('\f', '\\f')
                    :gsub('\'' , '\\\'')
                    :gsub('<' , '\\u003C')
                    :gsub('>' , '\\u003E')
    return esc
  end,
  extend = function (destination, source)
    for k,v in pairs(source) do
      destination[k] = v
    end 
    return destination
  end
}
```


```xml
<vars value='"<script/>"' />
<value>value</value><!-- "<script/>" -->
<value escape="html">value</value><!-- &quot;&lt;script/&gt;&quot; -->
<value escape="js">value</value><!-- \"\u003Cscript\/\u003E\" -->
```

### vars
Устаналивает локальную JavaScript переменную.
**имя будет принудительно переведено в lowercase**
```xml
<vars Illegar="1" question="'Ultimate Question of Life, The Universe, and Everything'" answer="question.length - 13" />
<value>Illegar</value><!-- undefined -->
<value>illegar</value><!-- 1 -->
<value>question</value><!-- Ultimate Question of Life, The Universe, and Everything -->
<value>answer</value><!-- 42  -->
```

### space
Служит для вывода пробела. Необходим в тех случаях, когда пробел в тектовом узле удаляется при компиляции, например:
```xml
Hello,<space/><value>json.name</value>!<!-- Hello, John! -->
```

### require
Вызывает через require модуль с параметрами по аналогии с `get`
```xml
<require name="name0">{some: 'data'}</require>
<!--
var __params0__ = {some: 'data'};
require("name0")(__params0__);
-->

<require name="name1">
  <params>
    {a: 1, b:2}
  </params>
  <param name="html">
  <div class="a">1</div>
  </param>
</require>
<!--
var __params1__ = {};
$.extend(__params1__, {a: 1, b:2});
__params1__.html = '<div class="a">1</div>';
require("name1")(__params1__);
-->

<require name="name2" params="{a:1, b:2}" />
<!--
var __params2__ = {a:1, b:2};
require("name2")(__params2__);
-->

<require name="name3" params="{a:1, b:2}">
  {a:2,b:3,c:4}
</require>
<!--
var __params3__ = {a:1, b:2};
$.extend(__params3__, {a:2,b:3,c:4});
require("name3")(__params3__);
-->
```


### set
Объявляет именованную функцию. Содержимое `set` не будет выполнено до тех пор, пока не будет вызван блок с таким же имененем с помощью `get`.
```xml
<set name="name">John</set>
```

```xml
<set name="full_name">
    <get name="name"/><space/>F. Kennedy
</set>
```

Внутри `set` доступен контекст `params`, передаваемый через `get`.
```xml
<set name="line">
  Hello,<space/><value>params.username</value>!
</set>
<get name="line">{username: "John"}</get><!-- Hello, John! -->
```

### get
Выводит содержимое блока, объявленного через `set`.
```xml
<get name="name" />
```

```xml
<get name="name">{'some': 'data'}</get>
<get name="test">
  {a: 1, b:2}
</get>

<get name="test">
  <params>
    {a: 1, b:2}
  </params>
  <param name="html">
  <div class="a">1</div>
  </param>
</get>

<get name="test" params="{a:1, b:2}" />
```

Внутри атрибута `name` можно использовать JavaScript выражения для вычисления имени блока во время выполнения. Значения выражений, заключенных в фигурные скобки, объединяются с примыкающим текстом. Помимо этого, можно использовать атрибут `select`.

```xml
<vars name="'foo'" />
<get select="name"/><!-- foo -->
<set name="foo">foo</set>
<set name="bar">bar</set>
<get name="b{true?'a':''}r"/><!-- bar -->
```

Существует быстрый способ вывести значение в атрибут:

```xml
<a href="{params.href}">Some link</a>
```

## Управляющие конструкции

### for

Выполняет итерацию по массиву или числовому ряду. неявно оборачивается if который проверяет iterate и его length, в связи с этим можно после закрытия `</for>` пришпилить `elseif` или `else` как в обычном `if` стеке

```xml
<!-- params.items = ['a', 'b', 'c'] -->
<for iterate="params.items" index="i" value="v">
  <value>params.items[i]</value>
</for><!-- abc -->

<!-- if (params.items && params.items.length)-->
  <for iterate="params.items" index="i" value="v">
    <value>v</value>
  </for><!-- abc -->
<!-- /if -->
<elseif test="foo">
  foo text
</elseif>
<elseif test="bar">
  bar text
</elseif>
<else>
  else text
</else>
```

### if, elseif, else

Условный оператор.

```xml
<if test="var0">
  <value>var0</value>
</if>
<elseif test="var2">
   <value>var2</value>
</elseif>
<else>
  ELSE
</else>
```

### switch case default

```xml
<switch test="var0">
  <case is="1">
    var is 1
  </case>
  <case is="'2'">
    var is '2'
  </case>
  <case is="a">
    var is `a`
  </case>
  <default>
    var is not 1 or 2
  </default>
</switch>
```

Если нужно 
```javascript
switch (z) {
  case 'a':
  case 'b':
  case 'c':
    domagick;
  break;
  case 'd':
    doD;
  break;
  default:
    'docommon'
}
```
пользуй аттрибут `any` и сепаратор значений `|`. 
не нужен `break`? пользуй аттрибут `nobreak` 
```xml
<switch test="z">
  <case any="'a' | 'b' | 'c'">
    <value>domagick</value>
  </case>
  <case is="'c'">
    <value>doD</value>
  </case>
  <default nobreak="1">
    docommon
  </default>
</switch>
```

## Остальные конструкции

### cdata

Служит для вывода блока CDATA.

```xml
<cdata>
  alert ("2" < 3);
</cdata><!-- <![CDATA[alert ("2" < 3);]]> -->
```

### comment

Выводит HTML комментарий.

```xml
<comment>comment</comment><!-- <!--comment--> -->
```

### doctype

Задает DOCTYPE генерируемой страницы.

```xml
<doctype>html</doctype><!-- <!doctype html> -->
```

### include
выпилено
### insert
Вставить файл напрямую в шаблон
`src` - относителен к текущему файлу (его папке)
```xml
<style type="text/css">
  <insert src="style.css"/>
<style>
<script>
  <insert src="inline-script.js"/>
</script>
```

### continue
### break
### return
вставляют в текущий стек выражений соответствующую конструкцию

# Примеры

## Использование

```javascript
var parser = new Parser(options);
parser.write(file.contents.toString('utf8'), file.path);
file.contents = parser.getSource();

gulp:

var festHardcore = require('gulp-fest-hardcore');
gulp.src('src/**/*.xml')
    .pipe(festHardcore())
    .pipe(beautify({
      indentSize: 2
    }))
    .pipe(gulp.dest('build/templates'))
```

## Использование set и get

```xml
<set name="host">http://e.mail.ru</set>
<set name="all">msglist</set>
<set name="new">sentmsg?compose</set>

<set name="all_link">
  <get name="host"/>/<get name="all"/>
</set>

<set name="new_link">
  <get name="host"/>/<get name="new"/>
</set>
```

## Интернационализация

### fest:plural - выпилено

