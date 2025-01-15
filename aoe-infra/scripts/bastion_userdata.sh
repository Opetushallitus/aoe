# Note: addUserData() automatically adds shebang at the start of the file.
mkfs -t xfs /dev/nvme1n1
mkdir /data
mount /dev/nvme1n1 /data
chmod 770 /data

echo -e "[mongodb-org-5.0] \nname=MongoDB Repository\nbaseurl=https://repo.mongodb.org/yum/amazon/2/mongodb-org/5.0/x86_64/\ngpgcheck=1 \nenabled=1 \ngpgkey=https://www.mongodb.org/static/pgp/server-5.0.asc" | sudo tee /etc/yum.repos.d/mongodb-org-5.0.repo

yum update
yum install -y htop python3-pip python3-wheel jq bash tmux nohup mongodb-org-shell
amazon-linux-extras install redis6 postgresql14

wget -O /usr/bin/global-bundle.pem https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem