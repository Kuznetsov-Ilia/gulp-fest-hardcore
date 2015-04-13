LuaSrcDiet

<require name="{hiy}-na" />
this.CONCAT refactor!


странная хуйня с переключением контекста из текста в теги((
написать в ридмике щито ния так делать;
<js>
  var someHtml = '<a href="#test">test</a>'
</js>




function decode(val)
  return val:gsub("&#38;", '&')
            :gsub("&#60;", '<')
            :gsub("&#62;", '>')
            :gsub("&#34;", '"')
            :gsub("&#39;", "'")
            :gsub("&lt;", "<")
            :gsub("&gt;", ">")
            :gsub("&quot;", '"')
            :gsub("&apos;", "'")
            :gsub("&amp;", "&")
end

local function encode(val)
  return val:gsub("&", "&amp;")
            :gsub("<", "&lt;")
            :gsub(">", "&gt;")
            :gsub('"', "&quot;")
            :gsub("'", "&apos;")
end
