#! /bin/bash
#
echo "moving server dev to prod"

cp dev/infraback/*.js prod/infraback
cp -R dev/infraback/node_modules prod/infraback/
cp dev/inframain/*.js prod/inframain

./prodRestart.sh
