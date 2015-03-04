Malache2
========

A new design of malache<br />
this soft is under Apache v2 license.
<br />
Malache2 is a web server based on node.js.<br />
you can build a website/webapp with malache2, and you need write codes in javascript.<br />
you can download the source code of malache2 directly to run it with node.js.<br />
sample code has already in the source code.<br />
<br />
when you create a new site, you have to create a folder in /sites, and edit /conf.js to add a domain with that folder.<br />
we call that folder you created in /sites "virtual directory".<br />
<br />
<br />
and then, in that folder you created, you need to create 3 more folders, Activities, Plugs and Templates.<br />
in folder Activities, you should put your scripts in.<br />
in folder Plugs, you should put your modules in.<br />
in folder Templates, you should put your html( or any static file) in.<br />
<br />
and then, create a conf.js in that folder you created in /sites, and edit it like this:<br />
```javascript
module.exports={active: "ajs",			//active file type
                template: "xml",		//tempalte file type	
                defaultPage: "index.ajs",		//default page
                contentTypes: {".html": "text/html;charset=utf-8",
                               ".htm": "text/html;charset=utf-8",
                               ".jpg": "image/*",
                               ".png": "image/*",
                               ".gif": "image/*",
                               ".txt": "text/plain;charset=utf-8",
                               ".ajs": "text/html;charst=utf-8"}};
```
when you created a conf.js in that folder you created in /sites, you can start to make your site.<br />
for example, we created a conf.js like what we've showed above in our virtual directory.<br />
and we've created folders Activities, Plugs, Templates in virtual directory.<br />
now, i can make a script named index.js, and put it into Activities.<br />
edit index.js like this:
```javascript
	var bob={name: "bob",age: 20};
	response.render({person: bob,ctime: new Date});
```


and then, we create index.xml in Templates, and edit it like this: 
```html
<html>
<body>
name: <%=bob.name%><br />
age: <%=bob.age%><br />
ctime: <%=ctime%>
</body>
</html>
```
<br /><br />
At last, you should add a domain in /conf.js in domains column.<br />
all finished. now, you can go to visit your site.
for more details, visit [wiki](https://github.com/malpower/Malache2/wiki).
