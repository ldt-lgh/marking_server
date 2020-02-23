#FROM centos:latest
#RUN yum -y install cairo cairo-devel  libjpeg-turbo-devel pango pango-devel pangomm 
from node:13
WORKDIR /usr/src/marking_api
COPY package.json .
RUN npm i
COPY . .
EXPOSE 8080
CMD ["node", "index.js"]
