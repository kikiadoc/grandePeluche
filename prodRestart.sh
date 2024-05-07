#
#! /bin/bash
#
# creation du lien
# sudo ln -s /home/ec2-user/kikibackend.service /etc/systemd/system/kikibackend.service
#
echo reload deamon / servers
sudo systemctl daemon-reload
#
sudo systemctl restart httpd.service
sudo systemctl restart kikibackend.service
 
