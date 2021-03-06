(function(){
	'use strict';

	var currentEl;

	initializeSockets();
	initializeBindings();

	var socketConnection;

	var menu = document.getElementById('menu');

	function room() {
		return window.location.href.split('/').pop().split('#').shift();
	}

	function initializeSockets(){
		socketConnection = io.connect(window.location.host, {
			'reconnect': true,
			'reconnection delay': 5000,
			'max reconnection attempts': 100
		});


		socketConnection.on('connect', function() {
			socketConnection.emit('room', { room: room(), group: 'players' });
		});
	}

	function initializeBindings(){
		var controlsList = ['up', 'down', 'left', 'right', 'select', 'start', 'full-screen', 'a', 'b', 'aa', 'bb'];
		var sharedControls = ['up-left','up-right','down-left','down-right'];

		for (var i = 0; i < controlsList.length; i++) {
			var id = controlsList[i]; 
			$$('#' + id).on('touchstart', onTouchStart);
			$$('#' + id).on('touchend', onTouchEnd);
			$$('#' + id).on('touchmove', onTouchMove);
		}
		
		for (var i = 0; i < sharedControls.length; i++) {
			var id = sharedControls[i]; 
			$$('#' + id).on('touchstart', function(ev){ onTouchStart(ev, {isShared: true});});
			$$('#' + id).on('touchend', function(ev){ onTouchEnd(ev, {isShared: true});});
		}

		$$('body').rotateRight(function(ev){toggleMenu(ev, true);});
		$$('body').rotateLeft(function(ev){toggleMenu(ev, false);});
	}


	function onTouchStart(ev, options) {
		if (typeof options === 'object' && options.isShared){
			var ids = ev.currentTarget.id.split('-');	
			for (var i = 0; i < ids.length; i++){
				activateEl(document.getElementById(ids[i]));
			}
		} else {
			activateEl(ev.currentTarget);
		}

		function activateEl(obj){
			obj.className = 'mousedown';
			socketConnection.emit('a', {k: obj.id, s: 1});
		}
		currentEl = ev.currentTarget;
	}

	function onTouchEnd(ev, options) {
		if (typeof options === 'object' && options.isShared){
			var ids = ev.currentTarget.id.split('-');
			for (var i = 0; i < ids.length; i++){
				deactivateEl(document.getElementById(ids[i]));
			}
		} else {
			deactivateEl(ev.currentTarget);
			void currentEl;
		}

		function deactivateEl(obj){
			obj.className = '';
			socketConnection.emit('a', {k: obj.id, s: 0});

		}
	}

	function onTouchMove (ev) {
		console.log(ev.currentTarget);
		if (ev.currentTarget !== currentEl){
			currentEl.className = '';
			onTouchEnd(currentEl);
		}
	}

	function toggleMenu(ev, isShown) {
		if (isShown){
			menu.className = 'shown';
		} else {
			menu.className = '';
		}
		socketConnection.emit('a', {s: isShown});
	}

}());
