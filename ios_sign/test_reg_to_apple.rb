require "pathname"
require "spaceship"
require "credentials_manager"

# ruby test_reg_to_apple.rb "liaoyanchi3@gmail.com" "new resign app 02" "uqwneuniqn32" "true"

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

credentials = CredentialsManager::AccountManager.new(user: acc)
Spaceship::Portal.login(credentials.user, credentials.password)
Spaceship::Portal.select_team

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

puts "====== Hello, Write End! ======"
