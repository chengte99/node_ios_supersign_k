require "pathname"
require "spaceship"
require "credentials_manager"

# puts "12313"

# STDOUT.print "456\n"

# name = gets
# puts "name = #{name}"

dic = {}
jsonStr = ""

# dic = {
#     "status" => -104,
#     "msg" => "login failed ...",
#     "acc" => "123",
#     "resultCode" => "456",
#     "resultString" => "789"
# }

if dic.empty?
    puts "dic is empty ..."
else
    puts "dic isn't empty ..."
    jsonStr = JSON[dic]
end

if jsonStr.empty?
    puts "jsonStr is empty ..."
else
    puts "jsonStr is: #{jsonStr}"
end