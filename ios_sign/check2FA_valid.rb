require "pathname"
require "spaceship"
require "credentials_manager"

# ruby check2FA_valid.rb "liaoyanchi3@gmail.com"

acc = ARGV[0]

puts "======Hello, Write Start======"

cwd_path = Pathname.new(File.dirname(__FILE__)).realpath
# puts  cwd_path

puts "帳戶: #{acc}"

credentials = CredentialsManager::AccountManager.new(user: acc)
Spaceship::Portal.login(credentials.user, credentials.password)
# Spaceship::Portal.select_team

# devices = Spaceship::Portal.device.all
# puts devices.count

# file = File.open("#{cwd_path}/acc_devices", "w")
# file.puts devices.count
# file.close

puts "====== Hello, Write End! ======"

