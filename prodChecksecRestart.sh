#! /bin/bash
#
# creation du lien
# sudo ln -s /home/ec2-user/kikichecksec.service /etc/systemd/system/kikichecksec.service
#
echo reload deamons - checksec
sudo systemctl daemon-reload
#
sudo systemctl restart kikichecksec.service
 

