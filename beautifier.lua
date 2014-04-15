#!/usr/bin/env lua

string.count = function(str, s2)
  local count = 0
  for i = 1, #str do
    if str:sub(i,i) == s2 then
      count = count + 1
    end
  end
  return count
end

string.trim = function(s)
  return (s:gsub("^%s*(.-)%s*$", "%1"))
end

local indent_str = '  '

local level = 0

local braces = {
  {'{','}'},
  {'(',')'},
}

local opens_function = function(line)
  local funcs = 0
  for exp in line:gfind('(.?)function') do
    if #exp == 0 or exp:match('[,{}%)%(%s=]') then
      funcs = funcs + 1
    end
  end
  local ends = 0
  for exp in line:gfind('function%s*(.*)%s*end') do
    if #exp == 0 or exp:match('[,{}%(%)%s]') then
      ends = ends + 1
    end
  end
  local dif = funcs - ends
  if dif > 0 then
    assert(dif==1)
    return dif
  else
    return 0
  end
end

local posts = {
  ['.*then$'] = 1,
  ['^repeat%s*$'] = 1,
  ['.*do%s*$'] = 1,
  ['^else%s*$'] = 1,
  ['^end.*%)'] = -1,
}

local pres = {
  ['^end,?$'] = -1,
  ['^until.*'] = -1,
  ['else$'] = -1,
  ['elseif.*'] = -1,
}

-- removes strings ('bla' -> '') and trailing comments
local isolate = function(l)
  local pure = l:gsub('"[^"]*"','""')
  pure = pure:gsub("'[^']*'","''")
  return pure:match('(.*)%-%-.*') or pure
end

local debugp = function() end
if os.getenv('LUDENTDEBUG') == '1' then
  debugp = print
end

local indent = function(src,dst)
  assert(src,dst)
  for line in src:lines() do
    line = line:trim() or ''
    local pure = isolate(line)
    
    local pre = 0
    local post = 0
    
    debugp('------',pure)
    
    for _,b in pairs(braces) do
      local dif = pure:count(b[1]) - pure:count(b[2])
      if dif ~= 0 then
        debugp('-- BRACE',dif,level)
      end
      if dif > 0 then
        post = post + dif
      elseif dif < 0 then
        pre = pre + dif
      end
    end
    
    for exp,inc in pairs(pres) do
      if pure:match(exp) then
        debugp('-- PRE',inc,level,exp,pure)
        pre = pre + inc
      end
    end
    
    local openf = opens_function(pure)
    if openf ~= 0 then
      debugp('-- FUNCTION',openf,level)
    end
    post = post + openf
    
    for exp,inc in pairs(posts) do
      if pure:match(exp) then
        debugp('-- POST',inc,level,exp,pure)
        post = post + inc
      end
    end
    
    --    debugp('------')
    
    -- print('L',level,post,pre,dif)
    
    level = level + pre
    assert(level >=0,line..' (pre/'..level..')')
    
    dst:write(string.rep(indent_str,level)..line..'\n')
    
    level = level + post
    assert(level >=0,line..' (post/'..level..')')
  end
  assert(level==0,level)
end

if #arg == 0 then
  indent(io.stdin,io.stdout)
else
  local copy = function(src,dst)
    local data = src:read('*a')
    dst:write(data)
    dst:flush()
  end
  for _,f in ipairs(arg) do
    print('LUDENTING',f)
    local src = io.open(f)
    local tmp = io.tmpfile()
    indent(src,tmp)
    src:close()
    src = io.open(f,'w')
    tmp:flush()
    tmp:seek('set')
    copy(tmp,src)
  end
end
