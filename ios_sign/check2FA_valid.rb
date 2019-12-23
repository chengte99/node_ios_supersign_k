require "pathname"
require "spaceship"
require "credentials_manager"

# require 'rubygems'
require 'net/http' #net/https does not have to be required anymore
require 'json'
require 'uri'

# ruby check2FA_valid.rb "liaoyanchi3@gmail.com"

acc = ARGV[0]

puts "======Hello, Write Start======"

cwd_path = Pathname.new(File.dirname(__FILE__)).realpath
# puts  cwd_path

puts "帳戶: #{acc}"

begin
    credentials = CredentialsManager::AccountManager.new(user: acc)
    Spaceship::Portal.login(credentials.user, credentials.password)
    Spaceship::Portal.select_team

    puts "#{acc} login success ..."
    
    devices = Spaceship::Portal.device.all

    dic = {
        "status" => 1,
        "msg" => "#{acc} login success ...",
        "acc" => "#{acc}",
        "devices" => devices.count
    }
rescue Exception => e  
    puts "#{acc} login failed ..."

    # p e.message.instance_of? Hash
    # p e.message.instance_of? String
    myHash = JSON.parse e.message.gsub('=>', ':')
    # p myHash.instance_of? Hash
    # p myHash.instance_of? String

    # p myHash
    # p myHash.keys
    # p myHash['resultCode']
    # p myHash['resultString']

    dic = {
        "status" => -104,
        "msg" => "#{acc} login failed ...",
        "acc" => "#{acc}",
        "resultCode" => myHash['resultCode'],
        "resultString" => myHash['resultString']
    }

ensure

    jsonStr = JSON[dic]
    # puts jsonStr

    # uri = URI('https://kritars.com/acc_login_return')
    uri = URI('http://10.159.5.141/acc_login_return')
    Net::HTTP.start(uri.host, uri.port, :use_ssl => uri.scheme == 'https') do |http|
    request = Net::HTTP::Post.new(uri, 'Content-Type' => 'application/json')
    request.body = jsonStr
    response = http.request request # Net::HTTPResponse object
    puts "#{response.body}"
    end
end

# devices = Spaceship::Portal.device.all
# puts devices.count

# file = File.open("#{cwd_path}/acc_devices", "w")
# file.puts devices.count
# file.close

puts "====== Hello, Write End! ======"

