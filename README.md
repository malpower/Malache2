Malache2
========

A new design of malache
this soft is under Apache v2 license.

Malache2 is a web server based on node.js.
you can build a website/webapp with malache2, and you need write codes in javascript.
you can download the source code of malache2 directly to run it with node.js.
sample code has already in the source code.

when you create a new site, you have to create a folder in /sites, and edit /conf.js to add a domain with that folder.
we call that folder you created in /sites "virtual directory".


and then, in that folder you created, you need to create 3 more folders, Actives, Requires and Templates.
in folder Actives, you should put your scripts in.
in folder Requires, you should put your modules in.
in folder Templates, you should put your html( or any static file) in.

and then, create a conf.js in that folder you created in /sites, and edit it like this:
module.exports={active: "ajs",			//active file type
                template: "xml",		//tempalte file type	
                defaultPage: "index.ajs",		//default page
                contentTypes: {".html": "text/html;charset=utf-8",		//content types, this will be responsed when user requests.
                               ".htm": "text/html;charset=utf-8",
                               ".jpg": "image/*",
                               ".png": "image/*",
                               ".gif": "image/*",
                               ".txt": "text/plain;charset=utf-8",
                               ".ajs": "text/html;charst=utf-8"}};

when you created a conf.js in that folder you created in /sites, you can start to make your site.
for example, we created a conf.js like what we've showed above in our virtual directory.
and we've created folders Actives, Requires, Templates in virtual directory.
now, i can make a script named index.js, and put it into Actives.
edit index.js like this:
	var bob={name: "bob",age: 20};
	response.render({person: bob,ctime: new Date});
	
	
and then, we create index.xml in Templates, and edit it like this: 
<html>
<body>
name: <%=bob.name%><br />
age: <%=bob.age%><br />
ctime: <%=ctime%>
</body>
</html>


all finished. now, you can go to visit your site.
