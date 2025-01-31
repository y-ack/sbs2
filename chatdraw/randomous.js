// Carlos Sanchez - 2017
// randomouscrap98@aol.com
// An enormous library full of garbage

// ---- List of utilities ----
// * TypeUtilities
// * HTMLUtilities
// * StorageUtilities
// * URLUtilities
// * RequestUtilities
// * StyleUtilities
// * CanvasUtilities
// * EventUtilities
// * ScreenUtilities
// * MathUtilities
// * DateUtilities
// * ArrayUtilities

// --- Shims ---
// Maybe your browser sucks and we have to fill in for it. Whatever.

//At LEAST make sure console logging doesn't completely break the script.
if (!window.console) window.console = {}
if (!window.console.log) window.console.log = function() {}

if (!String.prototype.trim)
	String.prototype.trim = function () { return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '') }

if (!Array.prototype.indexOf) {
	//Taken directly from ECMA-262 or whatever.
	Array.prototype.indexOf = function(value, fromIndex) {
		if (this === null) throw new TypeError('"this" is null or not defined')
		var o = Object(this)
		var len = o.length >>> 0
		if (len === 0) return -1
		var n = fromIndex | 0
		if (n >= len) return -1
		var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0)
		while (k < len) if (k in o && o[k] === searchElement) return k
		return -1
	}
}

// https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
if (!String.prototype.padStart) {
	String.prototype.padStart = function padStart(targetLength,padString) {
		targetLength = targetLength>>0 //floor if number or convert non-number to 0
		padString = String(padString || ' ')
		if (this.length > targetLength) {
			return String(this)
		} else {
			targetLength = targetLength-this.length
			if (targetLength > padString.length) {
				padString += padString.repeat(targetLength/padString.length) //append to original to ensure we are longer than needed
			}
			return padString.slice(0,targetLength) + String(this)
		}
	}
}

//This type of shim doesn't execute the selector function every time. A
//suitable function is chosen NOW, then assigned as a shim.
window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) { window.setTimeout(callback, 1000 / 60) }

// Source: https://github.com/jserz/js_piece/blob/master/DOM/ParentNode/prepend()/prepend().md
;(function (arr) {
	arr.forEach(function (item) {
		if (item.hasOwnProperty('prepend')) {
			return
		}
		Object.defineProperty(item, 'prepend',
		{
			configurable: true,
			enumerable: true,
			writable: true,
			value: function prepend() {
				var argArr = Array.prototype.slice.call(arguments),
				docFrag = document.createDocumentFragment()

				argArr.forEach(function (argItem) {
					var isNode = argItem instanceof Node
					docFrag.appendChild(isNode ? argItem : document.createTextNode(String(argItem)))
				})

				this.insertBefore(docFrag, this.firstChild)
			}
		})
	})
})([Element.prototype, Document.prototype, DocumentFragment.prototype])

var Base64 = {
	encode: window.atob,
	decode: window.btoa,
}

// --- Library OnLoad Setup ---
// This stuff needs to be performed AFTER the document is loaded and all that.
/*window.addEventListener("load", function() {
	UXUtilities._Setup()
});*/

// --- Extensions ---
// Extensions to existing prototypes (yeah, I know you're not supposed to do this)

//Returns a function that calls the associated function with any extra
//given arguments. It fixes loop closure issues. Altered from
//www.cosmocode.de/en/blog/gohr/2009-10/15-javascript-fixing-the-closure-scope-in-loops
//Example: You want x.addEventListener("click", myfunc(i)) in a loop.
//Do this: x.addEventListener("click", myfunc.callBind(i))
Function.prototype.callBind = function() {
	var fnc = this
	var args = arguments
	return function() {
		return fnc.apply(this, args)
	}
}

// --- TypeUtilities ---
// Functions for working with or detecting types.

var TypeUtilities = {
	IsFunction: function(x) {
		return x && Object.prototype.toString.call(x) == '[object Function]'
	},
	IsArray: function(x) {
		return x && x.constructor === Array
	},
	IsString: function(x) {
		return x && x.constructor === String
	}
}

// --- HTMLUtilities ---
// Encode or decode HTML entitities / generate unique IDs for elements / etc.

var HTMLUtilities = {
	_nextID : 0,
	UnescapeHTML : function(string) {
		var elem = document.createElement("textarea")
		elem.innerHTML = string
		return elem.value
	},
	EscapeHTML : function(html) {
		var text = document.createTextNode(html)
		var div = document.createElement('div')
		div.appendChild(text)
		return div.innerHTML
	},
	RemoveSelf : function(element) {
		element.parentNode.removeChild(element)
	},
	InsertBeforeSelf : function(newElement, element) {
		element.parentNode.insertBefore(newElement, element)
	},
	InsertAfterSelf : function(newElement, element) {
		element.parentNode.insertBefore(newElement, element.nextSibling)
	},
	InsertFirst : function(newElement, parent) {
		parent.insertBefore(newElement, parent.firstElementChild)
	},
	Replace : function(oldElement, newElement) {
		HTMLUtilities.InsertBeforeSelf(newElement, oldElement)
		HTMLUtilities.RemoveSelf(oldElement)
	},
	MoveToEnd : function(element) {
		element.parentNode.appendChild(element)
	},
	GetUniqueID : function(base) {
		return "genID_" + this._nextID++ + (base ? "_" + base : "")
	},
	NodeListToArray : function(nodeList) {
		var tempArray = []

		for (var i = 0; i < nodeList.length; i++)
			tempArray.push(nodeList[i])

		return tempArray
	},
	FindParentFromAction : function(element, action) {
		var nextElement = element

		while(!action(nextElement)) {
			if (nextElement.tagName.toLowerCase() === "body")
				return false

			nextElement = nextElement.parentNode
		}

		return nextElement
	},
	FindParentWithClass : function(element, className) {
		var regex = new RegExp("\\b" + className + "\\b")

		return HTMLUtilities.FindParentFromAction(element,
			function(nextElement) {
				return regex.test(nextElement.className)
			})
	},
	FindParentWithTag : function(element, tagName) {
		return HTMLUtilities.FindParentFromAction(element,
			function(nextElement) {
				return nextElement.tagName.toLowerCase() === tagName.toLowerCase()
			})
	},
	SimulateRadioSelect : function(selected, parent, selectedAttribute, selectedValue) {
		selectedAttribute = selectedAttribute || "data-selected"
		selectedValue = selectedValue || "true"
		var fakeRadios = parent.querySelectorAll("[" + selectedAttribute + "]")
		for (var i = 0; i < fakeRadios.length; i++)
			fakeRadios[i].removeAttribute(selectedAttribute)
		selected.setAttribute(selectedAttribute, selectedValue)
	},
	CreateUnsubmittableButton : function(text) {
		var button = document.createElement('button')
		button.setAttribute("type", "button")
		if (text) button.innerHTML = text
		return button
	},
	CreateContainer : function(className, id) {
		var container = document.createElement("div")
		container.className = className
		if (id) container.id = id
		container.dataset.createdon = new Date().getTime()
		return container
	},
	CreateSelect : function(options, name) {
		var select = document.createElement("select")
		if (name) select.setAttribute("name", name)
		for (var i = 0; i < options.length; i++) {
			var option = document.createElement("option")
			if (options[i].value && options[i].text) {
				option.innerHTML = options[i].text
				option.setAttribute("value", options[i].value)
			} else {
				option.innerHTML = options[i]
			}
			select.appendChild(option)
		}
		return select
	},
	SwapElements : function (obj1, obj2) {
		// save the location of obj2
		var parent2 = obj2.parentNode
		var next2 = obj2.nextSibling
		// special case for obj1 is the next sibling of obj2
		if (next2 === obj1) {
			// just put obj1 before obj2
			parent2.insertBefore(obj1, obj2)
		} else {
			// insert obj2 right before obj1
			obj1.parentNode.insertBefore(obj2, obj1)
			// now insert obj1 where obj2 was
			if (next2) {
				// if there was an element after obj2, then insert obj1 right before that
				parent2.insertBefore(obj1, next2)
			} else {
				// otherwise, just append as last child
				parent2.appendChild(obj1)
			}
		}
	}
}

//Allows the generation of a simulated radio using any type of element. More
//robust than the HTMLUtilities function; allows selection of radios based on
//string value.
var RadioSimulator = function(container, attribute, callback, clickCycle) {
	this.container = container
	this.attribute = attribute
	this.callback = callback
	this.clickCycle = clickCycle
	this.selectedAttribute = "data-selected"
}

//Allows manual selection of radio button. Can also select by value (simply
//pass the string value of the button to select.)
RadioSimulator.prototype.SelectRadio = function(button) {
	console.debug("Selecting radio: ")
	console.debug(button)

	if (TypeUtilities.IsString(button)) {
		button = this.container.querySelector('[' + this.attribute + '="' + button + '"]')
	} else if (this.clickCycle && button.hasAttribute(this.selectedAttribute)) {
		var radios = this.container.querySelectorAll("[" + this.attribute + "]")
		for (var i = 0; i < radios.length; i++) {
			if (radios[i] === button) {
				button = radios[(i + 1) % radios.length]
				break
			}
		}
	}

	var value = button.getAttribute(this.attribute)

	if (!value) {
		console.log("Could not select radio using this button! There is no " + this.attribute + " attribute!")
		return
	}

	if (this.callback)
		this.callback(value, button)

	if (!this.container) {
		console.log("There is no container for this RadioSimulator!")
		return
	}

	HTMLUtilities.SimulateRadioSelect(button, this.container, this.selectedAttribute)
}

RadioSimulator.prototype.CreateRadioButton = function(text, value) {
	var button = HTMLUtilities.CreateUnsubmittableButton(text)
	var me = this
	button.setAttribute(this.attribute, value)
	button.addEventListener("click", function(e) { me.SelectRadio(button) })
	return button
}

RadioSimulator.prototype.GetSelected = function() {
	return this.container.querySelector("[" + this.selectedAttribute + "]")
}

//Provides toast messages in a container centered near the bottom of the
//screen. You can create multiple toasters, but by default they'll all overlap
//each other. If you need custom styling per toaster, style off the
//container.id
function Toaster() {
	this.minDuration = 2000
	this.maxDuration = 10000
	this.container = false
}

Toaster.ToastClass = "randomousToast"
Toaster.ContainerClass = "randomousToastContainer"
Toaster.StyleID = HTMLUtilities.GetUniqueID("toastStyle")

Toaster.TrySetDefaultStyles = function() {
	var style = StyleUtilities.TrySingleStyle(Toaster.StyleID)

	if (style) {
		console.log("Setting up Toast default styles for the first time")
		style.AppendClasses(Toaster.ContainerClass,
			["position:absolute","bottom:1em","left:50%","transform:translate(-50%,0)",
			 "z-index:2000000000","pointer-events: none"])
		style.Append("." + Toaster.ContainerClass + "[data-fullscreen]",
			["position:fixed"])
		style.AppendClasses(Toaster.ToastClass,
			["max-width: 70vw","font-family:monospace","font-size:0.8rem",
			 "padding:0.5em 0.7em","background-color:#EEE","border-radius:0.5em",
			 "color:#333","opacity:1.0","transition: opacity 1s", "display: block",
			 "margin-bottom:0.1em","box-shadow: 0 0 1em -0.3em rgba(0,0,0,0.6)",
			 "overflow: hidden","text-overflow: ellipsis","text-align: center"])
		style.Append("." + Toaster.ToastClass + "[data-fadingout]",
			["opacity:0"])
		style.Append("." + Toaster.ToastClass + "[data-initialize]",
			["opacity:0"])
		style.Append("." + Toaster.ToastClass + "[data-fadingin]",
			["transition:opacity 0.2s"])
	}
}

Toaster.prototype.Attach = function(toasterParent) {
	Toaster.TrySetDefaultStyles()
	if (this.container) throw "Toaster already attached: " + this.container.id

	this.container = HTMLUtilities.CreateContainer(Toaster.ContainerClass,
		HTMLUtilities.GetUniqueID("toastContainer"))

	toasterParent.appendChild(this.container)
}

Toaster.prototype.AttachFullscreen = function(toasterParent) {
	this.Attach(toasterParent || document.body)
	this.container.dataset.fullscreen = "true"
}

Toaster.prototype.Detach = function() {
	if (!this.container) throw "Toaster not attached yet!"

	HTMLUtilities.RemoveSelf(this.container)
	this.container = false
}

Toaster.prototype.Toast = function(text, duration) {
	if (!this.container) throw "Toaster not attached yet!"

	duration = duration || MathUtilities.MinMax(text.length * 50, this.minDuration, this.maxDuration)

	var toast = document.createElement("div")
	toast.className = Toaster.ToastClass
	toast.dataset.createdon = new Date().getTime()
	toast.dataset.initialize = "true"
	toast.dataset.fadingin = "true"
	toast.innerHTML = text

	console.debug("Popping toast: " + text)
	this.container.appendChild(toast)

	setTimeout(function() { toast.removeAttribute("data-initialize") }, 10)
	//Give a big buffer zone of fadingin just in case people have long effects
	setTimeout(function() { toast.removeAttribute("data-fadingin") }, 1000)
	setTimeout(function() { toast.dataset.fadingout = "true" }, duration)
	//Give a big buffer zone of fadingout just in case people have long effects
	setTimeout(function() { HTMLUtilities.RemoveSelf(toast) }, duration + 2000)
}

//Allows fading of any element it's attached to. Element must have position:
//relative or absolute or something.
function Fader() { }

Fader.FaderClass = "randomousFader"
Fader.StyleID = HTMLUtilities.GetUniqueID("faderStyle")

Fader.TrySetDefaultStyles = function() {
	var style = StyleUtilities.TrySingleStyle(Fader.StyleID)

	if (style) {
		console.log("Setting up Fader default styles for the first time")
		style.AppendClasses(Fader.FaderClass,
			["position:absolute","top:0","left:0","width:100%","height:100%",
			 "padding:0","margin:0","pointer-events:none","display:block",
			 "z-index:1900000000"])
		style.Append("." + Fader.FaderClass + "[data-fullscreen]",
			["width:100vw","height:100vh","position:fixed"])
	}
}

Fader.CreateFadeElement = function() {
	var element = document.createElement("div")
	element.className = Fader.FaderClass
	element.id = HTMLUtilities.GetUniqueID("fader")
	return element
}

Fader.prototype.Attach = function(faderParent) {
	Fader.TrySetDefaultStyles()
	if (this.element) throw "Tried to attach fader but already attached: " + this.element.id
	this.element = Fader.CreateFadeElement()
	faderParent.appendChild(this.element)
}

Fader.prototype.AttachFullscreen = function(faderParent) {
	this.Attach(faderParent || document.body)
	this.element.dataset.fullscreen = "true"
}

Fader.prototype.Detach = function() {
	if (!this.element) throw "Not attached yet"
	HTMLUtilities.RemoveSelf(this.element)
	this.element = false
}

Fader.prototype.Fade = function(fadeDuration, color, cover) {
	if (cover)
		this.element.style.pointerEvents = "auto"
	else
		this.element.style.pointerEvents = "none"

	this.element.style.transition = "background-color " + fadeDuration + "ms"
	var me = this
	setTimeout(function() { me.element.style.backgroundColor = color }, 1)
}

//Creates a dialog-box complete with buttons. A good replacement for
//alert/confirm/etc.
function DialogBox() {
	//Since fader is "internal", parameters for fading should be too.
	this.fader = new Fader()
	this.fadeInTime = 100
	this.fadeOutTime = 100
	this.fadeColor = "rgba(0,0,0,0.5)"

	this.container = false
}

DialogBox.DialogClass = "randomousDialog"
DialogBox.ContainerClass = "randomousDialogContainer"
DialogBox.TextClass = "randomousDialogText"
DialogBox.ButtonContainerClass = "randomousDialogButtonContainer"
DialogBox.StyleID = HTMLUtilities.GetUniqueID("dialogStyle")

DialogBox.TrySetDefaultStyles = function() {
	var style = StyleUtilities.TrySingleStyle(DialogBox.StyleID)

	if (style) {
		console.log("Setting up DialogBox default styles for the first time")
		style.AppendClasses(DialogBox.ContainerClass,
			["position:absolute","top:50%","left:50%","transform:translate(-50%,-50%)",
			 "padding:0","margin:0","z-index:2000000000"])
		style.Append("." + DialogBox.ContainerClass + "[data-fullscreen]",
			["position:fixed"])
		style.AppendClasses(DialogBox.DialogClass,
			["max-width: 70vw","font-family:monospace","font-size:1.0rem",
			 "padding:1.0em 1.2em","background-color:#EEE","border-radius:0.5em",
			 "color:#333","opacity:1.0","transition: opacity 0.2s",
			 "display: block","box-shadow: 0 0 1em -0.3em rgba(0,0,0,0.6)"])
		style.AppendClasses(DialogBox.TextClass,
			["display: block","font-family: monospace", "overflow: hidden",
			 "text-overflow: ellipsis","margin-bottom: 0.5em","white-space:pre-wrap"])
		style.AppendClasses(DialogBox.ButtonContainerClass,
			["text-align: center","display: block"])
		style.Append("." + DialogBox.ButtonContainerClass + " button",
			["border: none","font-family: monospace", "overflow: hidden",
			 "text-overflow: ellipsis","font-size: 1.0em","font-weight:bold",
			 "padding: 0.3em 0.5em","margin: 0.2em 0.4em","border-radius:0.35em",
			 "background-color: #DDD","display: inline","cursor:pointer"])
		style.Append("." + DialogBox.ButtonContainerClass + " button:hover",
			["background-color: #CCC"])
	}
}

DialogBox.prototype.Attach = function(dialogParent) {
	DialogBox.TrySetDefaultStyles()
	if (this.container) throw "DialogBox already attached: " + this.container.id

	this.container = HTMLUtilities.CreateContainer(DialogBox.ContainerClass,
		HTMLUtilities.GetUniqueID("dialogContainer"))

	this.fader.Attach(dialogParent)
	dialogParent.appendChild(this.container)
}

DialogBox.prototype.AttachFullscreen = function(dialogParent) {
	this.Attach(dialogParent || document.body)
	this.fader.Detach()
	this.fader.AttachFullscreen(dialogParent)
	this.container.dataset.fullscreen = "true"
}

DialogBox.prototype.Detach = function() {
	if (!this.container) throw "DialogBox not attached yet!"

	this.fader.Detach()
	HTMLUtilities.RemoveSelf(this.container)
	this.container = false
}

DialogBox.prototype.Show = function(text, buttons) {
	var dialog = HTMLUtilities.CreateContainer(DialogBox.DialogClass)
	var dialogText = document.createElement("span")
	var dialogButtons = HTMLUtilities.CreateContainer(DialogBox.ButtonContainerClass)
	dialogText.innerHTML = text
	dialogText.className = DialogBox.TextClass
	dialog.appendChild(dialogText)
	dialog.appendChild(dialogButtons)

	var i
	var me = this

	for (i = 0; i < buttons.length; i++) {
		var btext = buttons[i]
		if (buttons[i].text) btext = buttons[i].text
		var callback = buttons[i].callback
		var newButton = HTMLUtilities.CreateUnsubmittableButton(btext)

		/* jshint ignore: start */
		newButton.addEventListener("click", function(callback) {
			HTMLUtilities.RemoveSelf(dialog)

			if (me.container.childNodes.length === 0)
				me.fader.Fade(me.fadeOutTime, "rgba(0,0,0,0)", false)

			if (callback)
				callback()
		}.callBind(callback))
		/* jshint ignore: end */

		dialogButtons.appendChild(newButton)
	}

	me.fader.Fade(me.fadeInTime, me.fadeColor, true)
	me.container.appendChild(dialog)
}

// --- UXUtilities ---
// Utilities specifically for User Experience. Things like custom alerts,
// custom confirms, toast, etc.

var UXUtilities = {
	UtilitiesContainer : HTMLUtilities.CreateContainer("randomousUtilitiesContainer",
		HTMLUtilities.GetUniqueID("utilitiesContainer")),
	_DefaultToaster : new Toaster(),
	_ScreenFader : new Fader(),
	_DefaultDialog : new DialogBox(),
	_Setup : function() {
		document.body.appendChild(UXUtilities.UtilitiesContainer)
		UXUtilities._DefaultToaster.AttachFullscreen(UXUtilities.UtilitiesContainer)
		UXUtilities._ScreenFader.AttachFullscreen(UXUtilities.UtilitiesContainer)
		UXUtilities._DefaultDialog.AttachFullscreen(UXUtilities.UtilitiesContainer)
	},
	Toast : function(message, duration) {
		UXUtilities._DefaultToaster.Toast(message,duration)
	},
	FadeScreen : function(duration, color) {
		UXUtilities._ScreenFader.Fade(duration, color)
	},
	Confirm : function(message, callback, yesMessage, noMessage) {
		UXUtilities._DefaultDialog.Show(message, [
			{ text: noMessage || "No", callback: function() { callback(false) }},
			{ text: yesMessage || "Yes", callback: function() { callback(true) }}
		])
	},
	Alert : function(message, callback, okMessage) {
		UXUtilities._DefaultDialog.Show(message, [
			{ text: okMessage || "OK", callback: function() { if (callback) callback() }}
		])
	}
}

// --- StorageUtilities ---
// Retrieve and store data put into browser storage (such as cookies,
// localstorage, etc.

var StorageUtilities = {
	GetAllCookies : function() {
		var cookies = {}
		var cookieStrings = document.cookie.split(";")

		for (var i = 0; i < cookieStrings.length; i++) {
			var matches = /([^=]+)=(.*)/.exec(cookieStrings[i])

			if (matches && matches.length >= 3)
				cookies[matches[1].trim()] = matches[2].trim()
		}

		return cookies
	},
	GetPHPSession : function() {
		return StorageUtilities.GetAllCookies().PHPSESSID
	},
	WriteSafeCookie : function(name, value, expireDays) {
		var expire = new Date()
		var storeValue = Base64.encode(JSON.stringify(value))
		expireDays = expireDays || 356
		expire.setTime(expire.getTime() + (expireDays * 24 * 60 * 60 * 1000))
		document.cookie = name + "=" + storeValue + "; expires=" + expire.toUTCString()
	},
	ReadRawCookie : function(name) {
		return StorageUtilities.GetAllCookies()[name]
	},
	ReadSafeCookie : function(name) {
		var raw = StorageUtilities.ReadRawCookie(name)

		if (raw)
			return JSON.parse(Base64.decode(raw))

		return null
	},
	HasCookie : function(name) {
		return name in StorageUtilities.GetAllCookies()
	},
	WriteLocal : function(name, value) {
		localStorage.setItem(name, JSON.stringify(value))
	},
	ReadLocal : function (name) {
		try {
			return JSON.parse(localStorage.getItem(name))
		} catch(error) {
			//console.log("Failed to retrieve " + name + " from local storage")
			return undefined
		}
	}
}

// --- URLUtilities ---
// Functions for parsing/manipulating URLs and... stuff.

var URLUtilities = {
	GetQueryString : function(url) {
		var queryPart = url.match(/(\?[^#]*)/)
		if (!queryPart) return ""
		return queryPart[1]
	},
	//Taken from Tarik on StackOverflow:
	//http://stackoverflow.com/questions/2090551/parse-query-string-in-javascript
	GetQueryVariable : function(variable, url) {
		var query = url ? URLUtilities.GetQueryString(url) : window.location.search
		var vars = query.substring(1).split('&')

		for (var i = 0; i < vars.length; i++) {
			var pair = vars[i].split('=')

			if (decodeURIComponent(pair[0]) == variable)
				return decodeURIComponent(pair[1])
		}

		return null
	},
	AddQueryVariable : function(variable, value, url) {
		if (URLUtilities.GetQueryString(url))
			url += "&"
		else
			url += "?"

		return url + variable + "=" + value
	}
}

//Special console logging
var _loglevel = 0
console.debug = function() {}
console.trace = function() {}

if (URLUtilities.GetQueryVariable("trace"))
	_loglevel = 100
else if (URLUtilities.GetQueryVariable("debug"))
	_loglevel = 50

if (_loglevel >= 50) {
	console.log("Debug mode is activated.")
	console.debug = console.log
}
if (_loglevel >= 100) {
	console.log("Trace mode is activated.")
	console.trace = console.log
}

// --- Request ---
// Helpers for POST/GET requests

var RequestUtilities = {
	XHRSimple : function(page, callback, data, extraHeaders) {
		var xhr = new XMLHttpRequest()

		if (data)
			xhr.open("POST", page)
		else
			xhr.open("GET", page)

		if (extraHeaders) {
			for (var key in extraHeaders) {
				if (extraHeaders.hasOwnProperty(key))
					xhr.setRequestHeader(key, extraHeaders[key])
			}
		}

		//Use generic completion function with given success callback
		xhr.addEventListener("load", function(event) {
			try {
				callback(event.target.response)
			} catch(e) {
				console.log("Oops, XHR callback didn't work. Dumping exception")
				console.log(e)
			}
		})

		if (data)
			xhr.send(data)
		else
			xhr.send()
	},
	XHRJSON: function(page, callback, data) {
		RequestUtilities.XHRSimple(page, function(response) {
			callback(JSON.parse(response))
		}, data, {"Content-type": "application/json"})
	}
}

// --- Color / Color Utilities ---
// Functions objects for working with colors in a generic way. Any canvas
// functions will use this object rather than some specific format.
function Color(r,g,b,a) {
	this.r = r
	this.g = g
	this.b = b
	this.a = a //This should be a decimal a ranging from 0 to 1
	if (this.a === undefined) this.a = 1
}

Color.prototype.ToArray = function(expandedAlpha) {
	return [this.r, this.g, this.b, this.a * (expandedAlpha ? 255 : 1)]
}

Color.prototype.ToRGBString = function() {
	var pre = "rgb"
	var vars = this.r + "," + this.g + "," + this.b
	if (this.a !== 1) {
		pre += "a"
		vars += "," + this.a
	}
	return pre + "(" + vars + ")"
}

Color.prototype.ToHexString = function(includeAlpha) {
	var string = "#" + this.r.toString(16).padStart(2, "0") +
		this.g.toString(16).padStart(2, "0") +
		this.b.toString(16).padStart(2, "0")

	if (includeAlpha)
		string += (255 * this.a).toString(16).padStart(2, "0")

	return string
}

//Find the maximum difference between the channels of two colors.
Color.prototype.MaxDifference = function(compareColor) {
	return Math.max(
		Math.abs(this.r - compareColor.r),
		Math.abs(this.g - compareColor.g),
		Math.abs(this.b - compareColor.b),
		Math.abs(this.a - compareColor.a) * 255)
}

// --- StyleUtilities ---
// Functions for working with styles and colors. Some of these may have a poor
// runtime

var StyleUtilities = {
	_cContext : document.createElement("canvas").getContext("2d"),
	GetColor : function(input) {
		this._cContext.clearRect(0,0,1,1)
		this._cContext.fillStyle = input
		this._cContext.fillRect(0,0,1,1)
		var data = this._cContext.getImageData(0,0,1,1).data
		return new Color(data[0], data[1], data[2], data[3] / 255)
	},
	_GetColorMath : function(f, func) {
		var arr = [0,0,0]
		func(f, arr)
		return new Color(255 * arr[0], 255 * arr[1], 255 * arr[2], 1)
	},
	GetGray : function(f) {
		return StyleUtilities._GetColorMath(f, MathUtilities.Color.SetGray)
	},
	GetRGB : function(f) {
		return StyleUtilities._GetColorMath(f, MathUtilities.Color.SetRGB)
	},
	GetHue : function(f) {
		return StyleUtilities._GetColorMath(f, MathUtilities.Color.SetHue)
	},
	//Create a style element WITHOUT inserting it into the head. The given ID
	//will be set. The style element returned will have extra functionality
	//attached to it for easy style appending.
	CreateStyleElement : function(id) {
		var mStyle = document.createElement("style")
		mStyle.appendChild(document.createTextNode(""))
		mStyle.nextInsert = 0
		mStyle.Append = function(selectors, rules) {
			var i, finalSelectors = []
			if (!TypeUtilities.IsArray(selectors)) selectors = [ selectors ]
			if (!TypeUtilities.IsArray(rules)) rules = [ rules ]
			for (i = 0; i < selectors.length; i++) {
				if (!TypeUtilities.IsArray(selectors[i])) selectors[i] = [ selectors[i] ]
				finalSelectors.push(selectors[i].join(" "))
			}
			mStyle.sheet.insertRule(
				finalSelectors.join(",") + "{" + rules.join(";") + "}", mStyle.nextInsert++)
		}
		mStyle.AppendClasses = function(classnames, rules) {
			var i, j
			if (!TypeUtilities.IsArray(classnames)) classnames = [ classnames ]
			for (i = 0; i < classnames.length; i++) {
				if (!TypeUtilities.IsArray(classnames[i])) classnames[i] = [ classnames[i] ]
				for (j = 0; j < classnames[i].length; j++)
					classnames[i][j] = "." + classnames[i][j]
			}
			mStyle.Append(classnames, rules)
		}
		if (id) mStyle.id = id
		return mStyle
	},
	InsertStylesAtTop : function(styles) {
		if (!TypeUtilities.IsArray(styles)) styles = [ styles ]
		for (var i = styles.length - 1; i >= 0; i--)
			document.head.insertBefore(styles[i], document.head.firstChild)
	},
	TrySingleStyle : function(id) {
		if (document.getElementById(id))
			return false

		var s = StyleUtilities.CreateStyleElement(id)
		StyleUtilities.InsertStylesAtTop(s)
		return s
	},
	//Converts width and height into the true width and height on the device (or
	//as close to it, anyway). Usefull mostly for canvases.
	GetTrueRect : function(element) {
		window.devicePixelRatio = window.devicePixelRatio || 1
		var pixelRatio = 1
		var rect = element.getBoundingClientRect()
		rect.width = (Math.round(pixelRatio * rect.right) - Math.round(pixelRatio * rect.left)) /
			window.devicePixelRatio
		rect.height = (Math.round(pixelRatio * rect.bottom) - Math.round(pixelRatio * rect.top)) /
			window.devicePixelRatio
		return rect
	},
	NoImageInterpolationRules : function() {
		return ["image-rendering:moz-crisp-edges","image-rendering:crisp-edges",
			"image-rendering:optimizespeed","image-rendering:pixelated"]
	}
}

StyleUtilities._cContext.canvas.width = StyleUtilities._cContext.canvas.height = 1

// --- CanvasUtilities ---
// Helper functions for dealing with Canvases.

var CanvasUtilities = {
	//WARNING! This function breaks canvases without a style set width or height
	//on devices with a higher devicePixelRatio than 1 O_O
	AutoSize : function(canvas) {
		var rect = StyleUtilities.GetTrueRect(canvas)
		canvas.width = rect.width
		canvas.height = rect.height
	},
	//Basically the opposite of autosize: sets the style to match the canvas
	//size.
	AutoStyle : function(canvas) {
		canvas.style.width = canvas.width + "px"
		canvas.style.height = canvas.height + "px"
	},
	GetScaling : function(canvas) {
		var rect = StyleUtilities.GetTrueRect(canvas)
		return [rect.width / canvas.width, rect.height / canvas.height]
	},
	//Set scaling of canvas. Alternatively, set the scaling of the given element
	//(canvas will remain unaffected)
	SetScaling : function(canvas, scale, element) {
		if (!TypeUtilities.IsArray(scale)) scale = [scale, scale]
		var oldWidth = canvas.style.width
		var oldHeight = canvas.style.height
		canvas.style.width = canvas.width + "px"
		canvas.style.height = canvas.height + "px"
		var rect = StyleUtilities.GetTrueRect(canvas)
		if (element) {
			canvas.style.width = oldWidth || ""
			canvas.style.height = oldHeight || ""
		} else {
			element = canvas
		}
		element.style.width = (rect.width * scale[0]) + "px"
		element.style.height = (rect.height * scale[1]) + "px"
	},
	CreateCopy : function(canvas, copyImage, x, y, width, height) {
		//Width and height are cropping, not scaling. X and Y are the place to
		//start the copy within the original canvas
		x = x || 0; y = y || 0
		if (width === undefined) width = canvas.width
		if (height === undefined) height = canvas.height
		var newCanvas = document.createElement("canvas")
		newCanvas.width = width
		newCanvas.height = height
		if (copyImage) CanvasUtilities.CopyInto(newCanvas.getContext("2d"), canvas, -x, -y)
		return newCanvas
	},
	CopyInto : function(context, canvas, x, y) {
		//x and y are the offset locations to place the copy into on the
		//receiving canvas
		x = x || 0; y = y || 0
		var oldComposition = context.globalCompositeOperation
		context.globalCompositeOperation = "copy"
		CanvasUtilities.OptimizedDrawImage(context, canvas, x, y)
		context.globalCompositeOperation = oldComposition
	},
	OptimizedDrawImage : function(context, image, x, y, scaleX, scaleY) {
		scaleX = scaleX || image.width
		scaleY = scaleY || image.height
		var oldImageSmoothing = context.imageSmoothingEnabled
		context.imageSmoothingEnabled = false
		context.drawImage(image, Math.floor(x), Math.floor(y), Math.floor(scaleX), Math.floor(scaleY))
		context.imageSmoothingEnabled = oldImageSmoothing
	},
	Clear : function(canvas, color) {
		var context = canvas.getContext("2d")
		var oldStyle = context.fillStyle
		var oldAlpha = context.globalAlpha
		if (color) {
			context.globalAlpha = 1
			context.fillStyle = color
			context.fillRect(0, 0, canvas.width, canvas.height)
		} else {
			context.clearRect(0, 0, canvas.width, canvas.height)
		}
		context.fillStyle = oldStyle
		context.globalAlpha = oldAlpha
	},
	DrawSolidCenteredRectangle : function(ctx, cx, cy, width, height, clear) {
		cx = Math.round(cx - width / 2)
		cy = Math.round(cy - height / 2)
		if (clear)
			ctx.clearRect(cx, cy, Math.round(width), Math.round(height))
		else
			ctx.fillRect(cx, cy, Math.round(width), Math.round(height))
		//The bounding rectangle for the area that was updated on the canvas.
		return [cx, cy, width, height]
	},
	DrawSolidEllipse: function(ctx, cx, cy, radius1, radius2, clear) {
		radius2 = radius2 || radius1
		var line = clear ? "clearRect" : "fillRect"
		var rs1 = radius1 * radius1
		var rs2 = radius2 * radius2
		var rss = rs1 * rs2
		var x, y
		cx -= 0.5 //A HACK OOPS
		cy -= 0.5

		for (y = -radius2 + 0.5; y <= radius2 - 0.5; y++) {
			for (x = -radius1 + 0.5; x <= radius1 - 0.5; x++) {
				if (x*x*rs2+y*y*rs1 <= rss) {
					ctx[line](Math.round(cx+x),Math.round(cy+y),Math.round(-x*2 + 0.5),1)
					break
				}
			}
		}

		return [cx - radius1, cy - radius2, radius1 * 2, radius2 * 2]
	},
	DrawNormalCenteredRectangle : function(ctx, cx, cy, width, height) {
		cx = cx - (width - 1) / 2
		cy = cy - (height - 1) / 2

		ctx.fillRect(cx, cy, width, height)

		//The bounding rectangle for the area that was updated on the canvas.
		return [cx, cy, width, height]
	},
	//For now, doesn't actually draw an ellipse
	DrawNormalCenteredEllipse: function(ctx, cx, cy, width, height) {
		ctx.beginPath()
		ctx.arc(cx, cy, width / 2, 0, Math.PI * 2, 0)
		ctx.fill()

		//The bounding rectangle for the area that was updated on the canvas.
		return [cx - width / 2 - 1, cy - height / 2 - 1, width, width]
	},
	//Wraps the given "normal eraser" function in the necessary crap to get the
	//eraser to function properly. Then you just have to fill wherever necessary.
	PerformNormalEraser : function(ctx, func) {
		var oldStyle = ctx.fillStyle
		var oldComposition = ctx.globalCompositeOperation
		ctx.fillStyle = "rgba(0,0,0,1)"
		ctx.globalCompositeOperation = "destination-out"
		var result = func()
		ctx.fillStyle = oldStyle
		ctx.globalCompositeOperation = oldComposition
		return result
	},
	//Draws a general line using the given function to generate each point.
	DrawLineRaw : function(ctx, sx, sy, tx, ty, width, clear, func) {
		var dist = MathUtilities.Distance(sx,sy,tx,ty);		 // length of line
		var ang = MathUtilities.SlopeAngle(tx-sx,ty-sy);	 // angle of line
		if (dist === 0) dist=0.001
		for (var i=0;i<dist;i+=0.5) {
			func(ctx, sx+Math.cos(ang)*i, sy+Math.sin(ang)*i, width, clear)
		}
		//This is just an approximation and will most likely be larger than
		//necessary. It is the bounding rectangle for the area that was updated
		return CanvasUtilities.ComputeBoundingBox(sx, sy, tx, ty, width)
	},
	//How to draw a single point on the SolidSquare line
	_DrawSolidSquareLineFunc : function(ctx, x, y, width, clear) {
		CanvasUtilities.DrawSolidCenteredRectangle(ctx, x, y, width, width, clear)
	},
	DrawSolidSquareLine : function(ctx, sx, sy, tx, ty, width, clear) {
		return CanvasUtilities.DrawLineRaw(ctx, sx, sy, tx, ty, width, clear,
			CanvasUtilities._DrawSolidSquareLineFunc)
	},
	//How to draw a single point on the SolidRound line
	_DrawSolidRoundLineFunc : function(ctx, x, y, width, clear) {
		CanvasUtilities.DrawSolidEllipse(ctx, x, y, width / 2, width / 2, clear)
	},
	DrawSolidRoundLine : function(ctx, sx, sy, tx, ty, width, clear) {
		return CanvasUtilities.DrawLineRaw(ctx, sx, sy, tx, ty, width, clear,
			CanvasUtilities._DrawSolidRoundLineFunc)
	},
	//How to draw a single point on the NormalSquare line
	_DrawNormalSquareLineFunc : function(ctx, x, y, width, clear) {
		CanvasUtilities.DrawNormalCenteredRectangle(ctx, x, y, width, width, clear)
	},
	DrawNormalSquareLine : function(ctx, sx, sy, tx, ty, width, clear) {
		if (clear) {
			return CanvasUtilities.PerformNormalEraser(ctx, function() {
				return CanvasUtilities.DrawLineRaw(ctx, sx, sy, tx, ty, width, false,
					CanvasUtilities._DrawNormalSquareLineFunc)
			})
		} else {
			return CanvasUtilities.DrawLineRaw(ctx, sx, sy, tx, ty, width, false,
				CanvasUtilities._DrawNormalSquareLineFunc)
		}
	},
	//How to draw a single point on the NormalRound line
	_DrawNormalRoundLineFunc : function(ctx, x, y, width, clear) {
		CanvasUtilities.DrawNormalCenteredEllipse(ctx, x, y, width, width, clear)
	},
	DrawNormalRoundLine : function(ctx, sx, sy, tx, ty, width, clear) {
		if (clear) {
			return CanvasUtilities.PerformNormalEraser(ctx, function() {
				return CanvasUtilities.DrawLineRaw(ctx, sx, sy, tx, ty, width, false,
					CanvasUtilities._DrawNormalRoundLineFunc)
			})
		} else {
			return CanvasUtilities.DrawLineRaw(ctx, sx, sy, tx, ty, width, false,
				CanvasUtilities._DrawNormalRoundLineFunc)
		}
	},
	DrawHollowRectangle : function(ctx, x, y, x2, y2, width) {
		CanvasUtilities.DrawSolidSquareLine(ctx, x, y, x2, y, width)
		CanvasUtilities.DrawSolidSquareLine(ctx, x, y2, x2, y2, width)
		CanvasUtilities.DrawSolidSquareLine(ctx, x, y, x, y2, width)
		CanvasUtilities.DrawSolidSquareLine(ctx, x2, y, x2, y2, width)
		return CanvasUtilities.ComputeBoundingBox(x, y, x2, y2, width)
	},
	ComputeBoundingBox : function(x, y, x2, y2, width) {
		return [Math.min(x, x2) - width, Math.min(y, y2) - width,
				  Math.abs(x - x2) + width * 2 + 1, Math.abs(y - y2) + width * 2 + 1]
	},
	ComputeTotalBoundingBox : function(boxes) {
		var finalBox = [ Infinity, Infinity, -Infinity, -Infinity]

		for (var i = 0; i < boxes.length; i++) {
			if (!boxes[i] || boxes[i].length < 4) return false
			finalBox[0] = Math.min(boxes[0], finalBox[0])
			finalBox[1] = Math.min(boxes[1], finalBox[1])
			finalBox[2] = Math.max(boxes[0] + boxes[2], finalBox[2])
			finalBox[3] = Math.max(boxes[1] + boxes[3], finalBox[3])
		}

		return finalBox
	},
	GetColor : function(context, x, y) {
		var data = context.getImageData(x, y, 1, 1).data
		return new Color(data[0], data[1], data[2], data[3] / 255)
	},
	GetColorFromData : function(data, i) {
		return new Color(data[i], data[i+1], data[i+2], data[i+3]/255)
	},
	//PutColorInData : function(color, data, i)
	//{
	//	  var array = color.ToArray(true)
	//	  for (var i = 0; i <
	//},
	//Convert x and y into an ImageDataCoordinate. Returns -1 if the coordinate
	//falls outside the canvas.
	ImageDataCoordinate : function(context, x, y) {
		if (x < 0 || x >= context.canvas.width || y < 0 || y > context.canvas.height) return -1
		return 4 * (x + y * context.canvas.width)
	},
	GenericFlood : function(context, x, y, floodFunction) {
		x = Math.floor(x); y = Math.floor(y)
		var canvas = context.canvas
		var iData = context.getImageData(0, 0, canvas.width, canvas.height)
		var data = iData.data
		var queueX = [], queueY = []
		var west, east, row, column
		var enqueue = function(qx, qy) { queueX.push(qx); queueY.push(qy) }
		if (floodFunction(context, x, y, data)) enqueue(x, y)
		while(queueX.length) {
			column = queueX.shift()
			row = queueY.shift()
			//Move west until it is just outside the range we want to fill. Move
			//east in a similar manner.
			for (west = column - 1; west >= -1 && floodFunction(context, west, row, data); west--)
			for (east = column + 1; east <= canvas.width && floodFunction(context, east, row, data); east++)
			//Move from west to east EXCLUSIVE and fill the queue with matching
			//north and south nodes.
			for (column = west + 1; column < east; column++) {
				if (row + 1 < canvas.height && floodFunction(context, column, row + 1, data))
					enqueue(column, row + 1)
				if (row - 1 >= 0 && floodFunction(context, column, row - 1, data))
					enqueue(column, row - 1)
			}
		}
		context.putImageData(iData, 0, 0)
	},
	FloodFill : function(context, sx, sy, color, threshold) {
		sx = Math.floor(sx); sy = Math.floor(sy)
		console.debug("Flood filling starting from " + sx + ", " + sy)
		threshold = threshold || 0
		var originalColor = CanvasUtilities.GetColor(context, sx, sy)
		var ocolorArray = originalColor.ToArray(true)
		var colorArray = color.ToArray(true)
		if (color.MaxDifference(originalColor) <= threshold) return
		var floodFunction = function(c, x, y, d) {
			var i = CanvasUtilities.ImageDataCoordinate(c, x, y)
			var currentColor = new Color(d[i], d[i+1], d[i+2], d[i+3]/255)
			if (originalColor.MaxDifference(currentColor) <= threshold) {
				for (var j = 0; j < 4; j++)
					d[i + j] = colorArray[j]
				return true
			} else {
				return false
			}
		}
		CanvasUtilities.GenericFlood(context, sx, sy, floodFunction)
	},
	SwapColor : function(context, original, newColor, threshold) {
		var canvas = context.canvas
		var iData = context.getImageData(0, 0, canvas.width, canvas.height)
		var data = iData.data
		var newArray = newColor.ToArray(true)
		var i, j

		for (i = 0; i < data.length; i+=4) {
			var cCol = CanvasUtilities.GetColorFromData(data, i)

			if (cCol.MaxDifference(original) <= threshold) {
				for (j = 0; j < 4; j++)
					data[i+j] = newArray[j]
			}
		}

		context.putImageData(iData, 0, 0)
	},
	ToString : function(canvas) {
		return canvas.toDataURL("image/png")
	},
	FromString : function(string) {
		var canvas = document.createElement("canvas")
		var image = new Image()
		image.addEventListener("load", function(e) {
			canvas.width = image.width
			canvas.height = image.height
			canvas.getContext("2d").drawImage(image, 0, 0)
		})
		image.src = string
		return canvas
	},
	//Draw the image from a data url into the given canvas.
	DrawDataURL : function(string, canvas, x, y, callback) {
		x = x || 0
		y = y || 0
		var image = new Image()
		image.addEventListener("load", function(e) {
			canvas.getContext("2d").drawImage(image, x, y)
			if (callback) callback(canvas, image)
		})
		image.src = string
	}
}

// --- Event Utilities ---
// Functions to help with built-in events (such as the mouse event).

var EventUtilities = {
	SignalCodes : { Cancel : 2, Run : 1, Wait : 0},
	mButtonMap : [ 1, 4, 2, 8, 16 ],
	MouseButtonToButtons : function(button) {
		return EventUtilities.mButtonMap[button]
	},
	//This is a NON-BLOCKING function that simply "schedules" the function to be
	//performed later if the signal is in the "WAIT" phase.
	ScheduleWaitingTask: function(signal, perform, interval) {
		interval = interval || 100
		var s = signal()
		if (s === EventUtilities.SignalCodes.Cancel)
			return
		else if (s === EventUtilities.SignalCodes.Run)
			perform()
		else
			window.setTimeout(function() { EventUtilities.ScheduleWaitingTask(signal, perform, interval) }, interval)
	}
}

// --- Screen Utilities ---
// Functions to help with setting up or altering the screen (such as fullscreen
// elements and whatever)

var ScreenUtilities = {
	LaunchIntoFullscreen : function(element) {
		if (element.requestFullscreen)
			element.requestFullscreen()
		else if (element.mozRequestFullScreen)
			element.mozRequestFullScreen()
		else if (element.webkitRequestFullscreen)
			element.webkitRequestFullscreen()
		else if (element.msRequestFullscreen)
			element.msRequestFullscreen()

		//Keep the UXUtilities INSIDE the fullscreen thingy.
		element.appendChild(UXUtilities.UtilitiesContainer)
	},
	ExitFullscreen : function() {
		if (document.exitFullscreen)
			document.exitFullscreen()
		else if (document.mozCancelFullScreen)
			document.mozCancelFullScreen()
		else if (document.webkitExitFullscreen)
			document.webkitExitFullscreen()
			
		//Replace the utilities back into the body.
		document.body.appendChild(UXUtilities.UtilitiesContainer)
	},
	IsFullscreen : function() {
		if (document.fullscreenElement || document.mozFullScreenElement ||
			document.webkitFullscreenElement)
			return true

		return false
	}
}

// --- Math Utilities ---
// Functions which provide extra math functionality.

var MathUtilities = {
	Distance : function(x1, y1, x2, y2) {
		return Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1))
	},
	Midpoint : function(x1, y1, x2, y2) {
		return [x1 + (x2 - x1) / 2, y1 + (y2 - y1) / 2]
	},
	MinMax : function(value, min, max) {
		if (min > max) {
			var temp = min
			min = max
			max = temp
		}
		return  Math.max(Math.min(value, max), min)
	},
	SlopeAngle : function(x,y) {
		return Math.atan(y/(x===0?0.0001:x))+(x<0?Math.PI:0)
	},
	IntRandom : function(max, min) {
		min = min || 0 //getOrDefault(min, 0)

		if (min > max) {
			var temp = min
			min = max
			max = temp
		}

		return Math.floor((Math.random() * (max - min)) + min)
	},
	LinearInterpolate : function(y1, y2, mu) {
		return y1 + mu * (y2 - y1)
	},
	CosInterpolate : function (y1, y2, mu) {
		var mu2 = (1 - Math.cos(mu * Math.PI)) / 2
		return (y1* (1 - mu2) + y2 * mu2)
	},
	NewGuid : function() {
		return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, function(c) {
			return (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
		})
	},
	GetSquare : function(x, y, x2, y2) {
		return [Math.min(x, x2), Math.min(y, y2), Math.abs(x - x2), Math.abs(y - y2)]
	},
	IsPointInSquare : function(point, square) {
		return point[0] >= square[0] && point[0] <= square[0] + square[2] &&
			point[1] >= square[1] && point[1] <= square[1] + square[3]
	},
	Color : {
		SetGray : function(f, arr) {
			arr[0] = f
			arr[1] = f
			arr[2] = f
		},
		SetRGB : function(f, arr) {
			//Duplicate code but fewer branches
			if (f < 0.5) {
				arr[0] = 1 - 2 * f
				arr[2] = 0
			} else {
				arr[0] = 0
				arr[2] = 2 * f - 1
			}
			arr[1] = 1 - Math.abs(f * 2 - 1)
		},
		SetHue : function(f, arr) {
			if (f < 1 / 6) {
				arr[0] = 1
				arr[1] = f * 6
				arr[2] = 0
			} else if (f < 2 / 6) {
				arr[0] = 1 - (f - 1 / 6) * 6
				arr[1] = 1
				arr[2] = 0
			} else if (f < 0.5) {
				arr[0] = 0
				arr[1] = 1
				arr[2] = (f - 2 / 6) * 6
			} else if (f < 4 / 6) {
				arr[0] = 0
				arr[1] = 1 - (f - 0.5) * 6
				arr[2] = 1
			} else if (f < 5 / 6) {
				arr[0] = (f - 4 / 6) * 6
				arr[1] = 0
				arr[2] = 1
			} else {
				arr[0] = 1
				arr[1] = 0
				arr[2] = 1 - (f - 5 / 6) * 6
			}
		}
	}
}

// --- Date Utilities ---
// Functions for working with and converting dates

var DateUtilities = {
	LocaleDateString : function(separator, date) {
		date = date || new Date()

		if (separator)
			return date.toLocaleDateString().replace(/\//g, separator)
		else
			return date.toLocaleDateString()
	}
}

// --- Array Utilities ---

var ArrayUtilities = {
	Contains : function(array, item) {
		return ArrayUtilities.Any(array, function(x) { return x === item })
	},
	Where : function(array, check) {
		var result = []
		for (var i = 0; i < array.length; i++)
			if (check(array[i], i))
				result.push(array[i])
		return result
	},
	Any : function(array, check) {
		for (var i = 0; i < array.length; i++)
			if (check(array[i], i))
				return true

		return false
	}
}

// --- UndoBuffer ---
// Basically all undo buffers work the same, so here's a generic object you can
// use for all your undo needs

function UndoBuffer(maxSize, maxVirtualIndex) {
	this.maxSize = maxSize || 5
	this.maxVirtualIndex = maxVirtualIndex || this.maxSize
	this.Clear()
}

UndoBuffer.prototype.Clear = function() {
	this.undoBuffer = []
	this.redoBuffer = []
	this.virtualIndex = 0
}

UndoBuffer.prototype._ShiftVirtualIndex = function(amount) {
	this.virtualIndex += amount
	while(this.virtualIndex < 0) this.virtualIndex += this.maxVirtualIndex
	this.virtualIndex = this.virtualIndex % this.maxVirtualIndex
}

UndoBuffer.prototype.UndoCount = function() { return this.undoBuffer.length }
UndoBuffer.prototype.RedoCount = function() { return this.redoBuffer.length }

UndoBuffer.prototype.Add = function(currentState) {
	this.undoBuffer.push(currentState)
	this.redoBuffer = []
	this._ShiftVirtualIndex(1)
	while(this.undoBuffer.length > this.maxSize)
		this.undoBuffer.shift()
	return this.UndoCount()
}

UndoBuffer.prototype.Undo = function(currentState) {
	if (this.UndoCount() <= 0) return
	this.redoBuffer.push(currentState)
	this._ShiftVirtualIndex(-1)
	return this.undoBuffer.pop()
}

UndoBuffer.prototype.Redo = function(currentState) {
	if (this.RedoCount() <= 0) return
	this.undoBuffer.push(currentState)
	this._ShiftVirtualIndex(1)
	return this.redoBuffer.pop()
}

UndoBuffer.prototype.ClearRedos = function() {
	this.redoBuffer = []
}

// --- CodeTester ---
// An easy way to run unit tests. Just create this object then fire away the
// RunAll function!

function CodeTester(element, tests) {
	this.element = element
	this.tests = tests
	this.stopOnFailure = false
}

CodeTester.prototype.Test = function(test, expectedValue) {
	var testElement = document.createElement("p")
	var testCode = document.createElement("span")
	var result = document.createElement("span")
	var extra = document.createElement("span")
	testCode.className = "testcode"
	testCode.innerHTML = test
	result.className = "result"
	extra.className = "extra"

	try {
		/* jshint ignore: start */
		var testResult = eval(test)
		var success = false

		if (expectedValue !== undefined) {
			testCode.innerHTML += " === " + expectedValue;	
			success = testResult === eval(expectedValue)
		} else {
			success = testResult
		}
		/* jshint ignore : end */

		if (success) {
			result.innerHTML = "[OK]"
			result.className += " success"
		} else {
			throw "returned " + testResult
		}
	} catch(ex) {
		result.innerHTML = "[FAIL]"
		result.className += " failure"
		extra.innerHTML = "(" + ex + ")"
	}

	testElement.appendChild(testCode)
	testElement.appendChild(result)
	testElement.appendChild(extra)

	return testElement
}

CodeTester.prototype.RunAll = function(fillElement, tests, stopOnFailure) {
	var failures = 0
	fillElement = fillElement || this.element
	tests= tests || this.tests
	stopOnFailure = stopOnFailure || this.stopOnFailure

	for (var i = 0; i < tests.length; i++) {
		var resultElement

		if (tests[i].indexOf("/") === 0) {
			resultElement = this.Test(tests[i].slice(1), tests[i + 1])
			i++
		} else {
			resultElement = this.Test(tests[i])
		}

		fillElement.appendChild(resultElement)
		if (resultElement.querySelector(".failure")) {
			failures++
			if (stopOnFailure) return
		}
	}

	return failures
}

// --- ConsoleEmulator ---
// Allows you to create a console-like system that performs output and input.
// You can attach logging to it to allow console logs to be seen on systems
// without dev tools or inspection.

function ConsoleEmulator() {
	this.OnRead = false
	this.OnReadChar = false
	this.rawConsole = false
	this.inputBuffer = false
	this.cursor = false
	var me = this

	this.keyPress = function(e) {
		if (!e.key || e.key.length > 1) return

		me.inputBuffer.textContent += e.key
		if (me.OnReadChar) me.OnReadChar(e.key)
		me.FixFloatingObjects()
	}
	this.keyDown = function(e) {
		if (e.keyCode === 8 && me.inputBuffer.textContent.length > 0) {
			me.inputBuffer.textContent = me.inputBuffer.textContent.substring(0,
				me.inputBuffer.textContent.length - 1)
		} else if (e.keyCode === 13 && me.inputBuffer.textContent.length > 0) {
			if (me.OnRead) me.OnRead(me.inputBuffer.textContent)
			me.WriteLine(me.inputBuffer.textContent)
			me.inputBuffer.textContent = ""
		}
	}
}

ConsoleEmulator.ClassName = "consoleEmulator"
ConsoleEmulator.CursorClassName = "cursor"
ConsoleEmulator.StyleID = HTMLUtilities.GetUniqueID("consoleEmulatorStyle")

ConsoleEmulator.prototype.TrySetDefaultStyles = function() {
	if (document.getElementById(ConsoleEmulator.StyleID))
		return

	console.log("Setting up ConsoleEmulator default styles for the first time")

	var style = document.createElement("style")
	style.appendChild(document.createTextNode(""))
	style.id = ConsoleEmulator.StyleID
	document.head.insertBefore(style, document.head.firstChild)
	style.sheet.insertRule(".consoleEmulator { font-family: monospace; " +
		"font-size: 12px; height: 30em; width: 45.5em; background-color: #222; " +
		"color: #CCC; display: block; word-wrap: break-word; overflow: hidden; " +
		"white-space: pre-wrap; padding: 1px; overflow-y: scroll; }", 0)
	style.sheet.insertRule(".consoleEmulator .cursor { color: limegreen; " +
		"/*animation: 1s blink step-end infinite;*/ } ", 1)
	style.sheet.insertRule(".consoleEmulator .input { color: #EEE; }", 2)
	style.sheet.insertRule(".consoleEmulator .red { color: red; }", 3)
	style.sheet.insertRule(".consoleEmulator .blue { color: blue; }", 4)
	style.sheet.insertRule(".consoleEmulator .green { color: green; }", 5)
	style.sheet.insertRule(".consoleEmulator .yellow { color: yellow; }", 6)
	style.sheet.insertRule(".consoleEmulator .purple { color: purple; }", 7)
}

ConsoleEmulator.prototype.FixFloatingObjects = function() {
	HTMLUtilities.MoveToEnd(this.inputBuffer)
	HTMLUtilities.MoveToEnd(this.cursor)
}

ConsoleEmulator.prototype.Write = function(output, color) {
	var outputWrapper = document.createElement("span")
	outputWrapper.innerHTML = output
	if (color) outputWrapper.className = color
	this.rawConsole.appendChild(outputWrapper)
	this.FixFloatingObjects()
}

ConsoleEmulator.prototype.WriteLine = function(output, color) {
	this.Write(output + "\n", color)
}

ConsoleEmulator.prototype.Generate = function() {
	this.inputBuffer = document.createElement("span")
	this.inputBuffer.className = "input"

	this.cursor = document.createElement("span")
	this.cursor.className = ConsoleEmulator.CursorClassName
	this.cursor.innerHTML = "█"

	this.rawConsole = document.createElement("div")
	this.rawConsole.className = ConsoleEmulator.ClassName
	this.rawConsole.addEventListener("keypress", this.keyPress)
	this.rawConsole.addEventListener("keydown", this.keyDown)
	this.rawConsole.setAttribute("tabindex", "-1")

	this.rawConsole.appendChild(this.inputBuffer)
	this.rawConsole.appendChild(this.cursor)

	this.TrySetDefaultStyles()

	return this.rawConsole
}

//WARNING: this captures the ConsoleEmulator object and elements. It cannot be
//detached or undone. Sorry!
ConsoleEmulator.prototype.SetAsConsoleLog = function(colored) {
	var log = console.log
	var debug = console.debug
	var trace = console.trace
	var me = this

	console.log = function(object) { log(object); me.WriteLine(object) }
	console.debug = function(object) { debug(object); me.WriteLine(object, colored ? "green": false) }
	console.trace = function(object) { trace(object); me.WriteLine(object, colored ? "blue": false) }
	console.debug("Attached console to ConsoleEmulator")
}
