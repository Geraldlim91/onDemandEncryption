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
1) sudo apt-get install glusterfs-server nginx python-dev python-pip python-mpi4py
2) pip install Django=1.5.5
3) pip install uwsgi
4) pip install -e git+https://github.com/scholrly/neo4django/#egg=neo4django
5) download the lastest PyCrypto package using <code>'wget http://ftp.dlitz.net/pub/dlitz/crypto/pycrypto/pycrypto-2.6.1.tar.gz'</code>
6) <code>tar zxf 'extract location'/pycrypto-2.6.1.tar.gz</code>
7) <code> cd 'pycrypto dir'</code>, <code> python setup.py install</code>
8) Reboot
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

</pre>



