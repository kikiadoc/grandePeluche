#! /bin/bash
logs=/home/ec2-user/checksec/datastore/yumUpdate.txt
reportJson=/home/ec2-user/checksec/datastore/yumUpdate.json
port=7070

echo "Début de la mise à jour système"

# update system
echo "Mise a jour systeme du" `date` > $logs
sudo yum update -y >> $logs
rcYumUpdate=$?
echo "fin de mise a jour systeme du" `date` >> $logs

# affichage du rapport dans les logs systeme
cat $logs

# publication de l'update sur pCloud
echo "debut publication resultat sur pCloud"
curl "http://localhost:$port/adminTest/pCloudUploadYumUpdate" --upload-file $logs
echo
echo "fin publication resultat sur pCloud"

echo '{ "name": "systemUpdate", "dthSecond":'`date '+%s'`', "dateUTC": "'`date`'", "rc":'$rcYumUpdate'}' > $reportJson

cat $reportJson
echo "Fin de la  mise a jour système"
