require "pathname"
require "spaceship"
require "credentials_manager"

require 'net/http' #net/https does not have to be required anymore
require 'json'
require 'uri'

# ruby update_acc_devices.rb "liaoyanchi3@gmail.com"

acc = ARGV[0]

puts "======Hello, Write Start======"

cwd_path = Pathname.new(File.dirname(__FILE__)).realpath
# puts  cwd_path

puts "帳戶: #{acc}"

credentials = CredentialsManager::AccountManager.new(user: acc)
Spaceship::Portal.login(credentials.user, credentials.password)
Spaceship::Portal.select_team

devices = Spaceship::Portal.device.all
# puts devices.count

# test example
# acc = "123123@mail.com"
# devices.count = 19

dic = {
    "acc" => acc,
    "devices" => devices.count
}

jsonStr = JSON[dic]
# puts jsonStr

uri = URI('https://kritars.com/update_devices')
Net::HTTP.start(uri.host, uri.port, :use_ssl => uri.scheme == 'https') do |http|
  request = Net::HTTP::Post.new(uri, 'Content-Type' => 'application/json')
  request.body = jsonStr
  response = http.request request # Net::HTTPResponse object
  puts "response #{response.body}"
end

puts "====== Hello, Write End! ======"