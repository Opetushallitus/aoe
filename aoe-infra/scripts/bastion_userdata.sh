# Note: addUserData() automatically adds shebang at the start of the file.
mkfs -t xfs /dev/nvme1n1
mkdir /data
mount /dev/nvme1n1 /data
chmod 770 /data

dnf update
dnf install -y htop python3-pip python3-wheel jq bash tmux nohup redis6 postgresql16

wget -O /usr/bin/global-bundle.pem https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem