# Note: addUserData() automatically adds shebang at the start of the file.
mkfs -t xfs /dev/nvme1n1
mkdir /data
mount /dev/nvme1n1 /data
chmod 770 /data
yum update
yum install -y htop python3-pip python3-wheel jq bash tmux nohup
amazon-linux-extras install redis6 postgresql16
