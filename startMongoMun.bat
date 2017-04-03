mkdir data
mongod --nojournal --smallfiles  --dbpath="./data" -storageEngine="mmapv1" --port 27272
PAUSE