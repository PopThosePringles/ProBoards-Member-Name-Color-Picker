"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Member_Name_Color_Picker = function () {
	function Member_Name_Color_Picker() {
		_classCallCheck(this, Member_Name_Color_Picker);
	}

	_createClass(Member_Name_Color_Picker, null, [{
		key: "init",
		value: function init() {
			this.PLUGIN_ID = "pd_member_name_color_picker";
			this.PLUGIN_KEY = "pd_member_name_color_picker";

			this.KEY_DATA = new Map();

			this.SETTINGS = {};
			this.IMAGES = {};

			if (typeof yootil == "undefined") {
				console.error("Member Name Color Picker: Yootil not installed");
				return;
			}

			this.setup();
			this.setup_data();

			yootil.bar.add("#", this.IMAGES.color, "Set Your Name Color", "member-name-color-picker", function () {
				return null;
			});

			$(this.ready.bind(this));
		}
	}, {
		key: "ready",
		value: function ready() {
			if (yootil.user.logged_in()) {
				this.create_color_field();
			}

			var location_check = yootil.location.search_results() || yootil.location.message_thread() || yootil.location.thread() || yootil.location.recent_posts() || yootil.location.recent_threads() || yootil.location.message_list() || yootil.location.members() || yootil.location.board();

			this.apply_color();

			if (location_check) {
				yootil.event.after_search(this.apply_color, this);
			}

			if ($(".shoutbox.container").length > 0) {
				this.monitor_shoutbox();
			}
		}
	}, {
		key: "setup",
		value: function setup() {
			var plugin = pb.plugin.get(this.PLUGIN_ID);

			if (plugin && plugin.settings) {
				this.SETTINGS = plugin.settings;
				this.IMAGES = plugin.images;
			}
		}
	}, {
		key: "setup_data",
		value: function setup_data() {
			var user_data = proboards.plugin.keys.data[this.PLUGIN_KEY];

			for (var key in user_data) {
				var id = parseInt(key, 10) || 0;

				if (id && !this.KEY_DATA.has(id)) {
					this.KEY_DATA.set(id, user_data[key]);
				}
			}
		}
	}, {
		key: "create_color_field",
		value: function create_color_field() {
			var _this = this;

			var user_id = parseInt(yootil.user.id(), 10);
			var user_color = "";

			if (this.KEY_DATA.has(user_id)) {
				var _user_color = this.KEY_DATA.get(user_id);

				if (this.is_valid_color(_user_color)) {
					user_color = _user_color;
				}
			}

			var $color_field = $("<input type='color' name='member-name-color-picker-field' id='member-name-color-picker-field' value='" + pb.text.escape_html(user_color) + "' />");

			$color_field.on("input", function (e) {

				_this.apply_color($(".user-link[data-id=" + parseInt(yootil.user.id(), 10) + "]"), e.target.value);
			});

			$color_field.on("change", function (e) {

				if (_this.is_valid_color(e.target.value)) {
					var _user_id = parseInt(yootil.user.id(), 10);

					yootil.key.set(_this.PLUGIN_KEY, e.target.value, _user_id);

					_this.KEY_DATA.set(_user_id, e.target.color);
					_this.apply_color($(".user-link"));
				}
			});

			$color_field.attr("title", "Change your display name color");

			var $item = $(yootil.bar.get("member-name-color-picker"));

			$item.replaceWith($color_field);
		}
	}, {
		key: "is_valid_color",
		value: function is_valid_color(c) {
			if (/^#[a-zA-Z0-9]{3,6}$/.test(c)) {
				return true;
			}

			return false;
		}
	}, {
		key: "monitor_shoutbox",
		value: function monitor_shoutbox() {
			var self = this;

			$.ajaxPrefilter(function (opts, orig_opts) {
				if (orig_opts.url == proboards.data("shoutbox_update_url")) {
					var orig_success = orig_opts.success;

					opts.success = function () {
						orig_success.apply(this, self.parse_realtime.apply(self, arguments));
					};
				}
			});
		}
	}, {
		key: "parse_realtime",
		value: function parse_realtime() {
			if (arguments && arguments.length && arguments[0].shoutbox_post) {
				var container = $("<span />").html(arguments[0].shoutbox_post);
				var posts = container.find("div.shoutbox-post");

				this.apply_color(posts.find(".user-link"));

				arguments[0].shoutbox_post = container.html();
			}

			return arguments || [];
		}
	}, {
		key: "user_has_color",
		value: function user_has_color(preview) {
			var color = preview ? preview : yootil.key.value(this.PLUGIN_KEY, parseInt(yootil.user.id(), 10));

			if (color && this.is_valid_color(color)) {
				return color;
			}

			return false;
		}
	}, {
		key: "apply_color",
		value: function apply_color(items, preview) {
			var _this2 = this;

			items = items || $(".user-link");

			items.each(function (i, e) {

				var id = parseInt($(e).attr("data-id"), 10);

				if (_this2.KEY_DATA.has(id) || preview) {
					var color = preview ? preview : _this2.KEY_DATA.get(id);

					if (_this2.is_valid_color(color)) {
						$(e).css("color", pb.text.escape_html(color));
					}
				}
			});
		}
	}]);

	return Member_Name_Color_Picker;
}();


Member_Name_Color_Picker.init();