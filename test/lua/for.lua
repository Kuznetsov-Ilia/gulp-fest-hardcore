return function (params) {
  local __expr0__ = ""
                         
if params.items and next(params.items) then
              
  __expr0__ = {}
                             
  for i, ii in ipairs(params.items) do
      
    
                            
    table.insert(__expr0__, params.items[i])
        
  end
  __expr0__ = table.concat(__expr0__)
        
end

local __expr1__ = ""
                         
if params.items and next(params.items) then
              
  __expr1__ = {}
                             
  for i, v in ipairs(params.items) do
      
    
                            
    table.insert(__expr1__, v)
        
  end
  __expr1__ = table.concat(__expr1__)
        
end
elseif foo then
             
  
                
  __expr1__ = "foo text"
             
end
elseif bar then
             
  
                
  __expr1__ = "bar text"
             
end
else
  
                  
  __expr1__ = "else text"
               
end

  return __expr0__..__expr1__
}
