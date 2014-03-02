onDemandEncryption
==================

1. Writing OS img file on SD Card:
--------------------------------

1) Download the latest Raspbian image from http://www.raspberrypi.org/downloads

<h3>on Windows:</h3> 

1) Use <a href='http://sourceforge.net/projects/win32diskimager/'>win32diskimager</a> to write image on to sd card.

<h3>on Linux/Mac OSX:</h3>

1) use the following command:

<pre><code>dd if='full path of image location' of='full path of sd card location' bs=4M</code></pre>


2. Required Installation:
----------------------
<p> Upon booting up Raspbian you will be brought to the a startup page, edit the setting if require, else move to finish.</p>

After booting into Raspbian:
<pre>
1) Do a <code>sudo apt-get update</code> 
2) Follow by a <code>sudo apt-get upgrade</code>
3) Reboot
</pre>

Install the following packages after reboot:
<pre>
1) sudo apt-get install glusterfs-server python-dev python-pip python-mpi4py
2) pip install Django=1.5.5
3) pip install -e git+https://github.com/scholrly/neo4django/#egg=neo4django
4) download the lastest PyCrypto package using <code>'wget http://ftp.dlitz.net/pub/dlitz/crypto/pycrypto/pycrypto-2.6.1.tar.gz'</code>
5) <code>tar zxf 'extract location'/pycrypto-2.6.1.tar.gz</code>
6) <code> cd 'pycrypto dir'</code>, <code> python setup.py install</code>
7) Reboot
</pre>

3. Obtain project from Git repository and save it to the home dir '/home/pi'

4. Cloning of sd card image:
------------------------------

<h3>on Windows:</h3> 

1) Use Win32DiskImager to create the img file for the sd card by using the "read function" and also not forgetting to input a file name, example: C:\Users\Jack\Desktop\onDemandEncrypt.img


<h3>on Linux/Mac OSX:</h3>

1) using the <code> dd if='sd card location' of=/home/pi/onDemandEncrypt.img bs=4M</code>
note: the sd card when mounted have 2 partition (example: sda, sda1), shown in /dev, select the whole sd card (sda)


After obtaining the image file, follow section 1 to write the image onto SD card.

5. Configure the communication between pi:
<pre>
rename the hostname for raspberry pi to prevent confusion between devices. 
<code>sudo nano /etc/hostname</code>
After changing the hostname, edit the hosts file to allow other device able to ping to this raspberry pi
<code>sudo vi /etc/hosts</code> and edit the line that include 127.0.1.1, change the default hostname to the new hostname you created.



</pre>

6. Configuring SSH authorize key:
<pre> 
1) Boot up the raspberry pi
2) <code>ssh-keygen</code>
note: just use the default and without passphase for the key
3) <code>ssh-copy-id pi@hostname</code>
note: hostname in term of other raspberry pi in the cluster.
</pre>

Repet section 5 and 6 on all raspberry pi

7. Configure GlusterFS server
<pre>
*Configure only on 1 of the raspberry pi in the cluster.
1) sudo gluster peer probe 'hostname'
note: hostname in terms of other raspberry pi in the cluster, if there is more than 1 raspberry pi, use space(' ') as a delimiter
2) Create gluster volume (example there is 3 raspberry pi in the cluster)
<code>sudo gluster volume create "volume name" transport tcp hostname1:/data hostname2:/data hostname3:/data</code>
3) To check created volume use <code> gluster volume info</code>
4) Start the volume using <code> sudo gluster volume start 'volume name'
</pre>

8. Installing web server:
<pre>
*Configure only on 1 of the raspberry pi in the cluster.
1) sudo apt-get install nginx
2) sudo pip install uwsgi
3) Edit src/one_nginx.conf 
    3.1) Make sure the one.sock is in the correct directory
    3.2) Edit the server_name to the raspberry pi IP address
    3.3) Make sure the directory for the location /static and location of uwsgi_params is correct.
4) Create soft link. <code>sudo ln -s /home/pi/onDemandNetwork/src/one_nginx.conf /etc/nginx/sites-enabled/one</code>
5) Remove default nginx web page, <code> sudo rm /etc/nginx/sites-enabled/default 
</pre>

9. Edit uwsgi parameters
*Only on the pi that is configured as web server
<pre>
1) Edit src/one_uwsgi.ini
    1.1) Make sure all the directory listed in this file is correct, the '%(homepath)' is similar to putting '/home/pi'
</pre>
10. Mounting GlusterFS volume:
<pre>
1) sudo nano /etc/fstab and add in this line
    1.1) 'hostname:/'gluster volume name' /home/pi/onDemandNetwork/archive/encrypted glusterfs defaults,_netdev 0 0'
    note: hostname in terms of the raspberry pi hostname that is used to create the gluster volume.
</pre>
10. Installing Database
<pre>
1) Install <a href='http://www.neo4j.org/download/other_versions'> Neo4J</a> on another machine (on Desktop or Laptop as Raspberry pi does not have enough system resources to run the database.)
note: Only install version < 1.9.6 as Neo4Django have not support version 2.0.0 onwards.

<h3>On Windows:</h3>
<pre>
1) in the Neo4J directory edit conf/neo4j-server.properties
    1.1) Add in 'org.neo4j.server.webserver.address=0.0.0.0' 
2) Run the Neo4J program and start database
</pre>
<h3>On Linux or Mac OSX:</h3>
<pre>
1) Extract the database to the home directory.
2) in the Neo4J directory edit conf/neo4j-server.properties
    2.1) Add in 'org.neo4j.server.webserver.address=0.0.0.0' 
3) To start the database <code>bin/neo4j start</code>
</pre>

11. Edit settings.py:
<pre>

NEO4J_DATABASES = {
    'default' : {
        'HOST':'192.168.1.1', #Edit the ip address to the desktop or laptop IP address that is installed with Neo4J
        'PORT':7474,  #Remain as default
        'ENDPOINT':'/db/data' #Remain as default
    }
}
</pre>

12. To run the project on the web:
<pre>
1) sudo service nginx restart
2) cd into src directory, run this command: <code>uwsgi --ini one_uwsgi.ini</code>
</pre>
