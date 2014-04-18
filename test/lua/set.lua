return function (params)
  function name0 (params)                                     return ""                    end
function name1 (myparams)                                     return "<div class=\"".. U.escapeHTML(params.className) .."\">"params.text.."</div>"                    end
function name2 (params)                                     return "<div class=\"".. U.escapeHTML(params.className) .."\">"params.text.."</div>"                    end
function name (params)                                     return "John"                    end
function full_name (params)             local __params0__ = {}                                         return name(__params0__)                        .." F. Kennedy"                    end
function line (params)                                     return "Hello, "params.username.."!"                    end
local __params1__ = {}                 
U.extend(__params1__, {username: "John"})              
function host (params)                                     return "http:\/\/e.mail.ru"                    end
function all (params)                                     return "msglist"                    end
function _new (params)                                     return "sentmsg?compose"                    end
function all_link (params)             local __params2__ = {}                 
local __params3__ = {}                                         return host(__params2__)                        .."\/"..all(__params3__)                                            end
function new_link (params)             local __params4__ = {}                 
local __params5__ = {}                                         return host(__params4__)                        .."\/".._new(__params5__)                                            end
  return line(__params1__)                        
end
