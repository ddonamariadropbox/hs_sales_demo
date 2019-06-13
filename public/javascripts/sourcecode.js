



function actuallyopen(signurl){

	HelloSign.init("f44c47cb276a359ca39cb521b1248522");
	HelloSign.open({"url": signurl, "skipDomainVerification": true});
}

function getsignurl(id){

	var data = null;
	var xhttp = new XMLHttpRequest();
	var full_url = "https://api.hellosign.com/v3/embedded/sign_url/" + id;

	xhttp.onreadystatechange=function(){
		if(this.readyState==4 && this.status==200){
			console.log(xhttp.responseText);
			var json = JSON.parse(this.responseText);
		//	document.getElementById('display').innerHTML = json.signature_request.signatures[0].signature_id;
			actuallyopen(json.embedded.sign_url);
		}

	};

	xhttp.open("POST",full_url);
	xhttp.setRequestHeader("Authorization", "Basic NjJkNjRiMThlNDgyNWFkMTdmMjlmZmJmZTZiNDk0Njc0ODM5OTgwMWRkMGNmNTFmZmEyY2QyNjIwYmRmMzY3ZDo=");
	xhttp.send(data);

}


function opendocnow() {

	//get input from form
	var entered_full_name = document.getElementById("first_name").value;
	var entered_email = document.getElementById("email").value;
	var custom_field_json = "[{\"name\":\"Full Name\", \"value\":\"" + entered_full_name +  "\", \"editor\":\"Client\", \"required\":true},{\"name\":\"Email\", \"value\":\"" + entered_email +  "\", \"editor\":\"Client\", \"required\":true}]";
	//document.getElementById('display').innerHTML = custom_field_json;


	var data = new FormData();
	data.append("client_id", "f44c47cb276a359ca39cb521b1248522");
	data.append("template_id", "7096686fd33f54e6c69d0e445254a1cfaf3e3637");
	data.append("subject", "this is the subject");
	data.append("message", "message");
	data.append("signers[Client][name]", entered_full_name);
	data.append("signers[Client][email_address]", entered_email);
	data.append("test_mode", "1");
	data.append("custom_fields", custom_field_json);


	var xhttp = new XMLHttpRequest();
	xhttp.withCredentials = true;

	xhttp.onreadystatechange=function(){
		if(this.readyState==4 && this.status==200){
			console.log(xhttp.responseText);
			var json = JSON.parse(this.responseText);
			//document.getElementById('display').innerHTML = json.signature_request.signatures[0].signature_id;
			getsignurl(json.signature_request.signatures[0].signature_id);
		}

	};

	xhttp.open("POST","https://api.hellosign.com/v3/signature_request/create_embedded_with_template");
	xhttp.setRequestHeader("Authorization", "Basic NjJkNjRiMThlNDgyNWFkMTdmMjlmZmJmZTZiNDk0Njc0ODM5OTgwMWRkMGNmNTFmZmEyY2QyNjIwYmRmMzY3ZDo=");
	xhttp.setRequestHeader("Accept", "*/*");
	xhttp.send(data);
}
