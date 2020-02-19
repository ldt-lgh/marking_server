#FROM centos:latest
#RUN yum -y install cairo cairo-devel  libjpeg-turbo-devel pango pango-devel pangomm 
from node:13
WORKDIR /usr/src/marking_admin
COPY package.json .
RUN npm i
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
