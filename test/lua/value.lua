return function (params)
  local value="<script/>";
  return value..U.escapeHTML(""..value)..$.escapeJS(""..value)..$.escapeJSON(""..value)
end
