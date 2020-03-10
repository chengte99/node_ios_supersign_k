require "pathname"
require "spaceship"
require "credentials_manager"

# ruby test_reg_to_apple.rb "estrelitali@aol.com" "com.ios.newsign04" "e48f8d4deb1b60d2e12acef4bcfe79b5" "true"

acc = ARGV[0]
appid = ARGV[1]
acc_md5 = ARGV[2]
is_add = ARGV[3]

# app_name = ARGV[2]
# tag = ARGV[3]

puts "======Hello, Write Start======"

cwd_path = Pathname.new(File.dirname(__FILE__)).realpath
# puts  cwd_path
cert_output_path = "#{cwd_path}/cert_file/pro_cert.cer"
# puts cert_output_path
output_path = "#{cwd_path}/account/#{acc_md5}.mobileprovision"
# puts output_path
provisioning_name = "#{appid}_adhoc"
# puts provisioning_name
txt_path = "#{cwd_path}/account/#{acc_md5}.txt"
# puts txt_path

puts "帳戶: #{acc}"
puts "appid: #{appid}"

puts "acc_md5: #{acc_md5}"
puts "is_add: #{is_add}"

# 先登录
# Spaceship.login("liaoyanchi3@gmail.com", "ZAQ!xsw2cde3")

dic = {}
jsonStr = ""

begin
    credentials = CredentialsManager::AccountManager.new(user: acc)
    Spaceship::Portal.login(credentials.user, credentials.password)
    Spaceship::Portal.select_team

    puts "#{acc} login success ..."

    # 查找指定的APP
    # app = Spaceship::Portal.app.find("appid")

    # # 先获取对应的证书 並下載
    # cert = Spaceship::Portal.certificate.production.all.first
    # File.write(cert_output_path, cert.download)

    # 参数传入true表示需要新增设备，例如：ruby UpdateProfile.rb true
    if is_add == "true"
        file = File.open(txt_path) #文本文件里录入的udid和设备名用tab分隔
        file.each do |line|
            arr = line.strip.split("%")
            # puts "arr[1] = #{arr[1]}, arr[0] = #{arr[0]}"
            device = Spaceship.device.create!(name: arr[1], udid: arr[0])
            puts "add device: #{device.name} #{device.udid} #{device.model}"
        end
    
        devices = Spaceship.device.all
    
        profiles = Array.new
        profiles += Spaceship.provisioning_profile.ad_hoc.all
    
        if profiles.count > 0
            puts "profiles.count > 0"
            profiles.each do |p|
                puts "Updating #{p.name}"
                p.devices = devices
                p.update!
            end
        else
            puts "profiles.count <= 0"
            # 先获取对应的证书
            cert = Spaceship::Portal.certificate.production.all.first
        
            #创建对应的描述文件
            Spaceship::Portal.provisioning_profile.ad_hoc.create!(bundle_id: appid, 
                                                                certificate: cert, 
                                                                name: provisioning_name)
        end
    end
    
    downloadProfiles = Array.new
    downloadProfiles += Spaceship.provisioning_profile.ad_hoc.all
    
    downloadProfiles.each do |p|
        puts "Downloading #{p.name}"
        File.write(output_path, p.download)
    end

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

        uri = URI('https://kritars.com/reg_to_acc_return')
        # uri = URI('http://192.168.20.18/reg_to_acc_return')
        Net::HTTP.start(uri.host, uri.port, :use_ssl => uri.scheme == 'https') do |http|
        request = Net::HTTP::Post.new(uri, 'Content-Type' => 'application/json')
        request.body = jsonStr
        response = http.request request # Net::HTTPResponse object
        puts "#{response.body}"
        end
    end    
end

puts "====== Hello, Write End! ======"
