var query=request.parameters["t"];

if (query=="y")
{
    response.render({data: "OK"},"dummy2.xml");
    return;
}
response.render({data: "OK"});