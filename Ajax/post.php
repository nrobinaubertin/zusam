<?php
session_start();

chdir(realpath(dirname(__FILE__)."/../"));
require_once('Core/Post.php');
require_once('Core/Location.php');
require_once('Core/Connect.php');
require_once('Core/Landing.php');	
require_once('Core/Accounts.php');
require_once('Core/Forum.php');	
require_once('Core/Notification.php');	
require_once('Core/File.php');	
require_once('Core/Utils.php');	
require_once('Core/Print_post.php');	
require_once('Core/Preview.php');	
require_once('Core/PasswordReset.php');	
require_once('Core/Mail.php');	
require_once('Core/Album.php');	
require_once('Core/Record.php');	
require_once('Core/TextCompiler.php');	

require_once('Pages/forum.php');
require_once('Pages/mainmenu.php');
require_once('Pages/profile.php');
require_once('Pages/home.php');

require_once('Reduc/ReducImage.php');
require_once('Reduc/ReducVideo.php');


// secure post variables for mongodb
$POST = [];
foreach($_POST as $K=>$V) {
	$POST[$K] = (String) $V;
}


// CONNECTED OR NOT
if($POST['action'] != null && $POST['action'] != "") {
	
	if($POST['action'] == "saveRecord") {
		recordStat(array("connected"=>$_SESSION['connected'], "loadingTime"=>$POST['loadingTime'], "screenHeight"=>$POST['screenHeight'],"screenWidth"=>$POST['screenWidth']));
		exit;
	}
	if($POST['action'] == "recordUsage") {
		//recordStat(array("connected"=>$_SESSION['connected'], "loadingTime"=>$POST['loadingTime'], "screenHeight"=>$POST['screenHeight'],"screenWidth"=>$POST['screenWidth']));
		recordUsage(array("usage"=>$POST['usage']));
		exit;
	}
}


// CONNECTED
if($_SESSION['connected']) {

	if($POST['action'] != null && $POST['action'] != "") {
		
		// TODO protect
		if($POST['action'] == "addFileToAlbum") {
			$uid = $POST['uid'];
			$fid = $POST['fid'];
			$albumId = $POST['albumId'];
			$fileId = $POST['fileId'];

			$u = account_load(array('_id'=>$uid));
			$f = forum_load(array('_id'=>$fid));

			if($u != false && $u != null && $f != false && $f != null) {
				
				$a = album_load(array('albumId'=>$albumId));
				// create album if there isn't one
				if($a == false || $a == null) {
					$a = album_initialize($albumId);
				}

				if($_FILES["image"]["size"] < 1024*1024*10 && $_FILES["image"]["type"] == "image/png") {
					$file = file_load(array("fileId"=>$fileId));
					if($file == null || $file == false) {
						$file = file_initialize($fileId, "jpg", $u['_id']);
					}
		$r = saveImage($_FILES["image"]["tmp_name"], pathTo2(array('url' => $file['location'], 'ext' => 'jpg', 'param' => 'file')), 1024, 1024);
					if($r) {
						album_addFile($a, $file);
						file_save($file);
						album_save($a);
					}
				}
			}
		}


		// TODO protect
		if($POST['action'] == "toggleButterfly") {
			$uid = $POST['uid'];
			$fid = $POST['fid'];
			$pid = $POST['pid'];
			$u = account_load(array('_id'=>$uid));
			$f = forum_load(array('_id'=>$fid));
			$p = post_load(array('_id'=>$pid));

			if($u != null && $u != false && $p != null && $p != false && $f != null && $f != false) {
				$r = new StdClass();
				if(array_key_exists($uid, $p['butterflies'])) {
					post_removeButterfly($p, $uid);	
					$r->color = "grey";
				} else {
					post_addButterfly($p, $uid);	
					$r->color = "#F7A71B";
				}
				post_save($p);
				$r->count = count($p['butterflies']);
				header('Content-Type: text/json; charset=UTF-8');
				echo(json_encode($r));
				$url_prev = search_miniature($text);
				account_save($u);
			}
			exit;
		}

		// TODO protect ?
		if($POST['action'] == "morePost") {

			$list = json_decode($POST['list'], true);
			
			$fid = $POST['fid'];
			$f = forum_load(array('_id'=>$fid));
			if($f != null && $f != false && in_array($_SESSION['uid'], $f['users'])) {
				$news = array_reverse($f['news']);
				$n = intval($POST['n']);
				if(!$n || $n == 0) {
					$n = 30;
				}
				$j = 0;
				$i = 0;
				$html = "";
				$newlist = [];
				// max 300 posts backwards
				while($i < $n && $j < count($news) && $j < 300) {
					if(!in_array($news[$j], $list)) {
						$p = post_load(array('_id'=>$news[$j]));
						if($p != null && $p != false) {
							$i++;
							$html .= print_post_mini($p);
							$newlist[] = $news[$j];
						}
					}
					$j++;
				}
				
				$r = new StdClass();
				$r->html = $html;
				$r->list = $newlist;
				$r->count = $i;
				$r->load = $j;
				header('Content-Type: text/json; charset=UTF-8');
				echo(json_encode($r));
			}
			exit;
		}
		
		// TODO protect file
		if($POST['action'] == "getFile") {

			$fileId = preg_replace("/\{\:([a-zA-Z0-9]+)\:\}/","$1",$POST['url']);
			$url = $POST['url'];
			$uid = $_SESSION['uid'];

			$file = file_load(array("fileId" => $fileId));	
			$html = file_print($file);

			$response = new StdClass();
			$response->url = $url;
			$response->html = $html;

			header('Content-Type: text/json; charset=UTF-8');
			echo(json_encode($response));
			exit;

		}
		
		// TODO protect album
		if($POST['action'] == "getAlbum") {

			$albumId = preg_replace("/\{\:\:([a-zA-Z0-9]+)\:\:\}/","$1",$POST['url']);
			$url = $POST['url'];

			$album = album_load(array("albumId" => $albumId));	
			$html = album_print($album, $POST['viewer']);

			$response = new StdClass();
			$response->url = $url;
			$response->html = $html;

			header('Content-Type: text/json; charset=UTF-8');
			echo(json_encode($response));
			exit;

		}

		// TODO protect ?
		if($POST['action'] == "gen_preview") {
		
			$url = $POST['url'];

			$ret = handleLink($url);
			header('Content-Type: text/json; charset=UTF-8');
			echo(json_encode($ret, JSON_UNESCAPED_UNICODE));
			exit;

			
			// First we check if the preview doesn't exist (to be as fast as possible)	
			//$p = preview_load(array('url' => $url));
			//if($p != null) {
			//	$ret = json_encode($p,JSON_UNESCAPED_UNICODE);
			//	header('Content-Type: text/json; charset=UTF-8');
			//	echo($ret);
			//	exit;
			//}
			//
			//// EXTENSION LESS IMAGES
			//$type = contentType($url);
			//if($type == 'image/jpeg' || $type == 'image/png' || $type == 'image/bmp' || $type == 'image/gif') {
			//	$data = [];
			//	$data['ret'] = create_post_preview($url);
			//	$data['url'] = $url;
			//	$data['type'] = "image";
			//	$data['info'] = "extensionless";
			//	header('Content-Type: text/json; charset=UTF-8');
			//	echo(json_encode($data));
			//	exit;
			//}

			//// GENERAL LINKS & OPEN GRAPH //
			//$ret = preview($url);
			//gen_miniature($url);
			//header('Content-Type: text/json; charset=UTF-8');
			//echo($ret);
			//exit;
		}


		if($POST['action'] == "changeSecretLink") {
			$uid = $POST['uid'];
			$fid = $POST['fid'];
			
			$u = account_load(array('_id' => $uid));
			$f = forum_load(array('_id'=>$fid));

			if($_SESSION['uid'] == $uid && in_array($uid, $f['users']) && $u['forums'][$fid] != null) {
				forum_changeLink($f);
				forum_save($f);
			}
			exit;
		}

		
		if($POST['action'] == "removeUserFromForum") {
			$uid = $POST['uid'];
			$fid = $POST['fid'];
			
			$u = account_load(array('_id' => $uid));
			$f = forum_load(array('_id'=> $fid));
			var_dump($u);

			if($_SESSION['uid'] == $uid) {
				forum_removeUser_andSave($f, $u);
			}
			var_dump($u);
			exit;
		}

		if($POST['action'] == "addImage") {

			$uid = $POST['uid'];
			$fileId = $POST['fileId'];
		
			if($_FILES["image"]["size"] < 1024*1024*31 && $_FILES["image"]["type"] == "image/png") {
				$u = account_load(array('_id' => $uid));
				if($u != null && $u != false) {
					$file = file_load(array("fileId"=>$fileId));
					if($file == null || $file == false) {
						$file = file_initialize($fileId, "jpg", $u['_id']);
					}
					$r = saveImage($_FILES["image"]["tmp_name"], pathTo2(array('url' => $file['location'], 'ext' => 'jpg', 'param' => 'file')), 1024, 1024);
					if($r) {
						file_save($file);
						echo($file['fileId']);
					}
				}
			}

			exit;
		}

		if($POST['action'] == "addVideo") {

			$uid = $POST['uid'];
			$fileId = $POST['fileId'];
		
			if($_FILES["video"]["size"] < 1024*1024*301) {
				$u = account_load(array('_id' => $uid));
				if($u != null && $u != false) {
					$file = file_initialize($fileId, "webm", $u['_id']);
			$r = saveVideo($_FILES["video"]["tmp_name"], pathTo2(array('url' => $file['location'], 'ext' => 'webm', 'param' => 'file')), $fileId);
					if($r) {
						file_save($file);
					}
				}
			}

			exit;
		}
		
		if($POST['action'] == "addSGF") {

			$uid = $POST['uid'];
			$fileId = $POST['fileId'];
		
			if($_FILES["sgf"]["size"] < 1024*1024*4) {
				$u = account_load(array('_id' => $uid));
				if($u != null && $u != false) {
					$file = file_initialize($fileId, "sgf", $u['_id']);
					// TODO verify that's a sgf an not something else...
	$r = copy($_FILES["sgf"]["tmp_name"], pathTo2(array('url' => $file['location'], 'ext' => 'sgf', 'param' => 'file')));
	$plop = file_get_contents($_FILES["sgf"]["tmp_name"]);
					if($r) {
						file_save($file);
					}
				}
			}
			exit;
		}

		if($POST['action'] == "addForum") {
			
			$name = $POST['name'];
			$uid = $POST['uid'];
			$name = htmlentities($name);

			$u = account_load(array('_id' => $uid));
			if($u != null && $u != false) {
				$f = forum_initialize($name);
				forum_addUser_andSave($f, $u);
			}

			exit;
		}

		if($POST['action'] == "addUserToForum") {

			$uid = $POST['uid'];
			$nid = $POST['nid'];

			$user = account_load(array('_id' => $uid));
			$notif = notification_load(array('_id' => $nid));

			if($_SESSION['uid'] == $uid) { 
				if($user != null && $user != false && $notif != null && $notif != false) {
					$forum = forum_load(array('_id'=>$notif['source']));
					if($forum != null && $forum != false) {
						forum_addUser_andSave($forum, $user);
					}
					notification_destroy($nid);
					//notification_erase_andSave($notif, $user);
				}
			} else {
				echo('no credentials');
			}

			exit;
		}

		if($POST['action'] == "changeAvatar") {

			$uid = $POST['uid'];

			if($_SESSION['uid'] == $uid) {
				if($_FILES["image"]["size"] < 1024*1024*2 && $_FILES["image"]["type"] == "image/png") {
					$r = saveImage($_FILES["image"]["tmp_name"], pathTo($uid, "avatar", "jpg"), 256, 256);
				}
			} else {
				echo('no credentials');
			}

			exit;
		}

		if($POST['action'] == "changeForum") {

			$name = $POST['name'];
			$uid = $POST['uid'];
			$fid = $POST['fid'];
			
			$u = account_load(array('_id' => $uid));
			$f = forum_load(array('_id'=>$fid));

			if($_SESSION['uid'] == $uid && $u['forums'][$fid] != null) {
				// name change
				if($f != null && $f != false && $u != null && $u != false) {
					if(!preg_match("/^\s*$/",$name)) {
						if(in_array($uid, $f['users'])) {
							$f['name'] = $name;
							forum_save($f);
						}
					}
				}

				// avatar change
				if($f != null && $f != false && $_FILES["avatar"]["size"] < 1024*1024*2 && $_FILES["avatar"]["type"] == "image/png") {
					$r = saveImage($_FILES["avatar"]["tmp_name"], pathTo($fid, "avatar", "jpg"), 256, 256);
				}
			} else {
				echo('no credentials');
			}

			exit;
		}

		if($POST['action'] == "changeProfile") {

			$name = $POST['name'];
			$new_password = $POST['new_password'];
			$old_password = $POST['old_password'];

			$uid = $POST['uid'];
			$u = account_load(array('_id' => $uid));

			if($_SESSION['uid'] == $uid) {
				if(preg_match("/^\s*$/",$name) != 1) {
					$name = htmlentities($name);
					$u['name'] = $name;
				}
				if(preg_match("/^\s*$/",$old_password) != 1) {
					if(password_verify($old_password, $u['password'])) {
						if(preg_match("/^\s*$/",$new_password) != 1) {
							$u['password'] = password_hash($new_password, PASSWORD_BCRYPT);
						}
					}
				}
				account_save($u);
			} else {
				echo('no credentials');
			}

			exit;
		}

		if($POST['action'] == "deletePost") {
			$id = $POST['id'];
			$p = post_load(array('_id'=>$id));
			if($p != false && $p != null && $p['uid'] == $_SESSION['uid']) {
				post_destroy($id);
			} else {
				echo('no credentials');
			}
			exit;
		}

		if($POST['action'] == "destroyAccount") {

			$uid = $POST['uid'];
			$password = $POST['password'];

			$u = account_load(array('_id' => $uid));
			if($uid == $_SESSION['uid']) {
				if($u != null && $u != false && preg_match("/^\s*$/",$password) != 1) {
					if(password_verify($password, $u['password'])) {
						account_destroy($uid);
						echo('ok');
					}
				} else {
					echo('fail');
				}
			} else {
				echo('no credentials');
			}
			exit;
		}

		if($POST['action'] == "inviteUser") {

			$fid = $POST['forum'];
			$uid = $POST['uid'];
			$mail = $POST['mail'];

			$u = account_load(array('_id' => $uid));
			$cible = account_load(array('mail' => $mail));
			if($cible != false && $cible != "") {
				$cible = (String) $cible['_id'];
			} else {
				$cible = $mail;
			}
			$forum = forum_load(array('_id'=>$fid));

			if($_SESSION['uid'] == $uid && $u['forums'][$fid] != null) {
				if($forum != null && $forum != false && $mail != "") {
					$n = notification_initialize(array(
							"type" => "invitation", 
							"text" => $forum['name'], 
							"data" => array("forum"=>$forum['_id'],"mail"=>$mail),
							"source" => $forum['_id'], 
							"target" => $cible
						));	
					notification_save($n);
					echo("ok");
				}
			} else {
				echo('no credentials');
			}
			$url_prev = search_miniature($text);
			account_save($u);
			exit;
		}

		if($POST['action'] == "removeNotification") {

			$uid = $POST['uid'];
			$nid = $POST['nid'];

			$user = account_load(array('_id' => $uid));
			$notif = notification_load(array('_id' => $nid));

			if($_SESSION['uid'] == $uid && $notif['target'] == $uid) {  
				if($user != null && $user != false && $notif != null && $notif != false) {
					notification_destroy($nid);
				}
			} else {
				echo('no credentials');
			}
			exit;
		}

	}

// NOT CONNECTED
} else {
	
	if($POST['action'] != null && $POST['action'] != "") {

		if($POST['action'] == "passwordReset") {

			$mail = $POST['mail'];
			$u = account_load(array('mail'=>$mail));
			if($u != false && $u != null) {
				$uid = (String) $u['_id'];
				$pr = pr_initialize($uid);
				mail_resetPassword($u['mail'], "http://zus.am?action=reset&id=".$pr['_id']."&key=".$pr['key'], $u['name']);
				// reset the key for security reasons
				$pr['key'] == "";
				pr_save($pr);
				echo('ok');
				exit;
			}
		}
	}

}

?>
