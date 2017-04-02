mkdir data
mongod --port 27272 --nojournal --storageEngine="mmapv1" --dbpath=".\data"
PAUSE
