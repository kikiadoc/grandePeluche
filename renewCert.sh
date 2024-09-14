#!/bin/bash
echo "ne pas oublier d'ouvrir LES firewall 1 (externe sur VPC) et 2 (interne sur EC2) "
echo "AJOUTER LES REGLES EN DEBUT DE LISTE"
echo "Certbot renew..."
sudo certbot renew
echo "Certbot certificates..."
sudo certbot certificates
