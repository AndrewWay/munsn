mkdir data
mongod --port 27017 --nojournal --smallfiles  --dbpath="./data" -storageEngine="mmapv1"
PAUSE
