require "pathname"
require "spaceship"
require "credentials_manager"

acc = ARGV[0]
appid = ARGV[1]
model = ARGV[2]
udid = ARGV[3]
app_name = ARGV[4]
tag = ARGV[5]

puts "======Hello, Write Start======"

cwd_path = Pathname.new(File.dirname(__FILE__)).realpath
# puts  cwd_path
cert_output_path = "#{cwd_path}/cert_file/pro_cert.cer"
# puts cert_output_path
output_path = "#{cwd_path}/#{app_name}/#{tag}.mobileprovision"
# puts output_path
provisioning_name = "#{appid}_adhoc"
# puts provisioning_name

puts "帳戶: #{acc}"
puts "appid: #{appid}"
puts "手機: #{model}"
puts "UDID: #{udid}"
puts "App: #{app_name}"
puts "描述文件名稱: #{tag}"

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

# 新增设备的UDID
Spaceship::Portal.device.create!(name: model, udid: udid)
devices = Spaceship::Portal.device.all
# puts devices

all_profiles = Array.new
all_profiles += Spaceship.provisioning_profile.ad_hoc.all

if all_profiles.count > 0
    puts "all_profiles.count > 0"
    all_profiles.each do |p|
        puts "Updating #{p.name}"
        p.devices = devices
        p.update!
    end
else
    puts "all_profiles.count <= 0"
    # 先获取对应的证书
    cert = Spaceship::Portal.certificate.production.all.first

    #创建对应的描述文件
    Spaceship::Portal.provisioning_profile.ad_hoc.create!(bundle_id: appid, 
                                                        certificate: cert, 
                                                        name: provisioning_name)
end

downloadProfiles = Array.new
downloadProfiles += Spaceship.provisioning_profile.ad_hoc.all

downloadProfiles.each do |p|
    puts "Downloading #{p.name}"
    File.write(output_path, p.download)
end

puts "====== Hello, Write End! ======"