echo "Installing python..!"
./python-3.9.0-amd64.exe

echo "Python installed..!"

where python > tmp
export PYTHON_HOME=<tmp
echo $PYTHON_HOME
rm -rfd tmp

echo "Adding python to path"
export PATH=$PATH:$PYTHON_HOME



echo "Installing pip..!"
curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py

D:/installations/python/python.exe get-pip.py
D:/installations/python/Scripts/pip install selenium


