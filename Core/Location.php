<?php

function p2l($path) {
	//$path = preg_replace("/\/srv\/http/","http://nibou.eu",$path);
	$path = preg_replace("/\/srv\/http\/zusam/","http://zus.am",$path);
	//$path = preg_replace("/\/srv\/http/","http://localhost/",$path);
	return $path;
}

function pathTo($url, $param, $ext) {
	return pathTo2(array('url' => $url, 'param' => $param, 'ext' => $ext));
}

function pathTo2($args) {

	$url = $args['url'];
	$param = $args['param'];
	$ext = $args['ext'];
	$dir = $args['dir'];

	//$root_dir = "/zusam/";
	$root_dir = "/";

	if(!$dir && ($param == "" || $url == "")) {
		return false;
	}
	if($ext == "") {
		$ext = ".".pathinfo($url, PATHINFO_EXTENSION);
	} else {
		if($ext{0} != ".") {
			$ext = ".".$ext;
		}
	}
	$loc = "Data";
	if(!$dir) {
		if($param == "assets") {
			$path = "Assets/".$url.$ext; 
			return preg_replace("/\/+/","/",$_SERVER['DOCUMENT_ROOT'].$root_dir.$path);
		}
		if($param == "mini") {
			$path = $loc."/miniature/".hash("md5", $url).$ext; 
			return preg_replace("/\/+/","/",$_SERVER['DOCUMENT_ROOT'].$root_dir.$path);
		}
		if($param == "avatar") {
			$path = $loc."/avatar/".$url.$ext; 
			return preg_replace("/\/+/","/",$_SERVER['DOCUMENT_ROOT'].$root_dir.$path);
		}
		if($param == "file") {
			$path = $loc."/file/".$url.$ext; 
			return preg_replace("/\/+/","/",$_SERVER['DOCUMENT_ROOT'].$root_dir.$path);
		}
		if($param == "tmp") {
			$path = "tmp/".hash("md5", $url); 
			return $path;
		}
		if($param == "default_avatar") {
			$path = "Assets/avatar/".$url; 
			return preg_replace("/\/+/","/",$_SERVER['DOCUMENT_ROOT'].$root_dir.$path);
		}
	} else {
		if($param == "default_avatar") {
			$path = "Assets/avatar"; 
			return preg_replace("/\/+/","/",$_SERVER['DOCUMENT_ROOT'].$root_dir.$path);
		}
	}
}

?>
