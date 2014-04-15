return function (params) {
  local __expr0__ = ""
                            
local __test0__ = var0
                        
if __test0__ == 1 then
      
  
                  
  __expr0__ = "var is 1"
               
elseif __test0__ == '2' then
      
  
                  
  __expr0__ = "var is \'2\'"
               
elseif __test0__ == a then
      
  
                  
  __expr0__ = "var is `a`"
               
else
  
                   
  __expr0__ = "var is not 1 or 2"
                
end

                                   

                                        

  return __expr0__
}
