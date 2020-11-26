


function runAllSequentially(e, t) {
	var i = -1,
		n = setTimeout.bind(null, function () {
			if (++i === e.length) return void t();
			e[i].run(n)
		});
	n()
} ! function (e, t, i, n, r, o, s) {
	e.GoogleAnalyticsObject = r, e.ga = e.ga || function () {
		(e.ga.q = e.ga.q || []).push(arguments)
	}, e.ga.l = 1 * new Date, o = t.createElement(i), s = t.getElementsByTagName(i)[0], o.async = 1, s.parentNode.insertBefore(o, s)
}(window, document, "script", 0, "ga"), ga("create", "UA-48530561-3", "auto"), ga("send", "pageview"),
	function (e) {
		if ("object" == typeof exports && "undefined" != typeof module) module.exports = e();
		else if ("function" == typeof define && define.amd) define([], e);
		else {
			("undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this).adapter = e()
		}
	}(function () {
		return function o(s, a, c) {
			function l(t, e) {
				if (!a[t]) {
					if (!s[t]) {
						var i = "function" == typeof require && require;
						if (!e && i) return i(t, !0);
						if (d) return d(t, !0);
						var n = new Error("Cannot find module '" + t + "'");
						throw n.code = "MODULE_NOT_FOUND", n
					}
					var r = a[t] = {
						exports:
							{}
					};
					s[t][0].call(r.exports, function (e) {
						return l(s[t][1][e] || e)
					}, r, r.exports, o, s, a, c)
				}
				return a[t].exports
			}
			for (var d = "function" == typeof require && require, e = 0; e < c.length; e++) l(c[e]);
			return l
		}(
			{
				1: [function (e, t, i) {
					"use strict";
					var L = e("sdp");

					function c(e, t, i, n, r) {
						var o = L.writeRtpDescription(e.kind, t);
						if (o += L.writeIceParameters(e.iceGatherer.getLocalParameters()), o += L.writeDtlsParameters(e.dtlsTransport.getLocalParameters(), "offer" === i ? "actpass" : r || "active"), o += "a=mid:" + e.mid + "\r\n", e.rtpSender && e.rtpReceiver ? o += "a=sendrecv\r\n" : e.rtpSender ? o += "a=sendonly\r\n" : e.rtpReceiver ? o += "a=recvonly\r\n" : o += "a=inactive\r\n", e.rtpSender) {
							var s = e.rtpSender._initialTrackId || e.rtpSender.track.id;
							e.rtpSender._initialTrackId = s;
							var a = "msid:" + (n ? n.id : "-") + " " + s + "\r\n";
							o += "a=" + a, o += "a=ssrc:" + e.sendEncodingParameters[0].ssrc + " " + a, e.sendEncodingParameters[0].rtx && (o += "a=ssrc:" + e.sendEncodingParameters[0].rtx.ssrc + " " + a, o += "a=ssrc-group:FID " + e.sendEncodingParameters[0].ssrc + " " + e.sendEncodingParameters[0].rtx.ssrc + "\r\n")
						}
						return o += "a=ssrc:" + e.sendEncodingParameters[0].ssrc + " cname:" + L.localCName + "\r\n", e.rtpSender && e.sendEncodingParameters[0].rtx && (o += "a=ssrc:" + e.sendEncodingParameters[0].rtx.ssrc + " cname:" + L.localCName + "\r\n"), o
					}

					function B(l, d) {
						function h(e, t) {
							e = parseInt(e, 10);
							for (var i = 0; i < t.length; i++)
								if (t[i].payloadType === e || t[i].preferredPayloadType === e) return t[i]
						}
						var u = {
							codecs: [],
							headerExtensions: [],
							fecMechanisms: []
						};
						return l.codecs.forEach(function (i) {
							for (var e = 0; e < d.codecs.length; e++) {
								var t = d.codecs[e];
								if (i.name.toLowerCase() === t.name.toLowerCase() && i.clockRate === t.clockRate) {
									if ("rtx" === i.name.toLowerCase() && i.parameters && t.parameters.apt && (n = i, r = t, o = l.codecs, s = d.codecs, c = a = void 0, a = h(n.parameters.apt, o), c = h(r.parameters.apt, s), !a || !c || a.name.toLowerCase() !== c.name.toLowerCase())) continue;
									(t = JSON.parse(JSON.stringify(t))).numChannels = Math.min(i.numChannels, t.numChannels), u.codecs.push(t), t.rtcpFeedback = t.rtcpFeedback.filter(function (e) {
										for (var t = 0; t < i.rtcpFeedback.length; t++)
											if (i.rtcpFeedback[t].type === e.type && i.rtcpFeedback[t].parameter === e.parameter) return !0;
										return !1
									});
									break
								}
							}
							var n, r, o, s, a, c
						}), l.headerExtensions.forEach(function (e) {
							for (var t = 0; t < d.headerExtensions.length; t++) {
								var i = d.headerExtensions[t];
								if (e.uri === i.uri) {
									u.headerExtensions.push(i);
									break
								}
							}
						}), u
					}

					function o(e, t, i) {
						return -1 !==
							{
								offer:
								{
									setLocalDescription: ["stable", "have-local-offer"],
									setRemoteDescription: ["stable", "have-remote-offer"]
								},
								answer:
								{
									setLocalDescription: ["have-remote-offer", "have-local-pranswer"],
									setRemoteDescription: ["have-local-offer", "have-remote-pranswer"]
								}
							}[t][e].indexOf(i)
					}

					function F(e, t) {
						var i = e.getRemoteCandidates().find(function (e) {
							return t.foundation === e.foundation && t.ip === e.ip && t.port === e.port && t.priority === e.priority && t.protocol === e.protocol && t.type === e.type
						});
						return i || e.addRemoteCandidate(t), !i
					}

					function f(e, t) {
						var i = new Error(t);
						return i.name = e, i.code = {
							NotSupportedError: 9,
							InvalidStateError: 11,
							InvalidAccessError: 15,
							TypeError: void 0,
							OperationError: void 0
						}[e], i
					}
					t.exports = function (O, D) {
						function M(e, t) {
							t.addTrack(e), t.dispatchEvent(new O.MediaStreamTrackEvent("addtrack",
								{
									track: e
								}))
						}

						function r(e, t, i, n) {
							var r = new Event("track");
							r.track = t, r.receiver = i, r.transceiver = {
								receiver: i
							}, r.streams = n, O.setTimeout(function () {
								e._dispatchEvent("track", r)
							})
						}

						function n(e) {
							var t = this,
								i = document.createDocumentFragment();
							if (["addEventListener", "removeEventListener", "dispatchEvent"].forEach(function (e) {
								t[e] = i[e].bind(i)
							}), this.canTrickleIceCandidates = null, this.needNegotiation = !1, this.localStreams = [], this.remoteStreams = [], this._localDescription = null, this._remoteDescription = null, this.signalingState = "stable", this.iceConnectionState = "new", this.connectionState = "new", this.iceGatheringState = "new", e = JSON.parse(JSON.stringify(e ||
								{})), this.usingBundle = "max-bundle" === e.bundlePolicy, "negotiate" === e.rtcpMuxPolicy) throw f("NotSupportedError", "rtcpMuxPolicy 'negotiate' is not supported");
							switch (e.rtcpMuxPolicy || (e.rtcpMuxPolicy = "require"), e.iceTransportPolicy) {
								case "all":
								case "relay":
									break;
								default:
									e.iceTransportPolicy = "all"
							}
							switch (e.bundlePolicy) {
								case "balanced":
								case "max-compat":
								case "max-bundle":
									break;
								default:
									e.bundlePolicy = "balanced"
							}
							if (e.iceServers = function (e, n) {
								var r = !1;
								return (e = JSON.parse(JSON.stringify(e))).filter(function (e) {
									if (e && (e.urls || e.url)) {
										var t = e.urls || e.url;
										e.url && !e.urls && console.warn("RTCIceServer.url is deprecated! Use urls instead.");
										var i = "string" == typeof t;
										return i && (t = [t]), t = t.filter(function (e) {
											return 0 === e.indexOf("turn:") && -1 !== e.indexOf("transport=udp") && -1 === e.indexOf("turn:[") && !r ? r = !0 : 0 === e.indexOf("stun:") && 14393 <= n && -1 === e.indexOf("?transport=udp")
										}), delete e.url, e.urls = i ? t[0] : t, !!t.length
									}
								})
							}(e.iceServers || [], D), this._iceGatherers = [], e.iceCandidatePoolSize)
								for (var n = e.iceCandidatePoolSize; 0 < n; n--) this._iceGatherers.push(new O.RTCIceGatherer(
									{
										iceServers: e.iceServers,
										gatherPolicy: e.iceTransportPolicy
									}));
							else e.iceCandidatePoolSize = 0;
							this._config = e, this.transceivers = [], this._sdpSessionId = L.generateSessionId(), this._sdpSessionVersion = 0, this._dtlsRole = void 0, this._isClosed = !1
						}
						Object.defineProperty(n.prototype, "localDescription",
							{
								configurable: !0,
								get: function () {
									return this._localDescription
								}
							}), Object.defineProperty(n.prototype, "remoteDescription",
								{
									configurable: !0,
									get: function () {
										return this._remoteDescription
									}
								}), n.prototype.onicecandidate = null, n.prototype.onaddstream = null, n.prototype.ontrack = null, n.prototype.onremovestream = null, n.prototype.onsignalingstatechange = null, n.prototype.oniceconnectionstatechange = null, n.prototype.onconnectionstatechange = null, n.prototype.onicegatheringstatechange = null, n.prototype.onnegotiationneeded = null, n.prototype.ondatachannel = null, n.prototype._dispatchEvent = function (e, t) {
									this._isClosed || (this.dispatchEvent(t), "function" == typeof this["on" + e] && this["on" + e](t))
								}, n.prototype._emitGatheringStateChange = function () {
									var e = new Event("icegatheringstatechange");
									this._dispatchEvent("icegatheringstatechange", e)
								}, n.prototype.getConfiguration = function () {
									return this._config
								}, n.prototype.getLocalStreams = function () {
									return this.localStreams
								}, n.prototype.getRemoteStreams = function () {
									return this.remoteStreams
								}, n.prototype._createTransceiver = function (e, t) {
									var i = 0 < this.transceivers.length,
										n = {
											track: null,
											iceGatherer: null,
											iceTransport: null,
											dtlsTransport: null,
											localCapabilities: null,
											remoteCapabilities: null,
											rtpSender: null,
											rtpReceiver: null,
											kind: e,
											mid: null,
											sendEncodingParameters: null,
											recvEncodingParameters: null,
											stream: null,
											associatedRemoteMediaStreams: [],
											wantReceive: !0
										};
									if (this.usingBundle && i) n.iceTransport = this.transceivers[0].iceTransport, n.dtlsTransport = this.transceivers[0].dtlsTransport;
									else {
										var r = this._createIceAndDtlsTransports();
										n.iceTransport = r.iceTransport, n.dtlsTransport = r.dtlsTransport
									}
									return t || this.transceivers.push(n), n
								}, n.prototype.addTrack = function (t, e) {
									if (this._isClosed) throw f("InvalidStateError", "Attempted to call addTrack on a closed peerconnection.");
									var i;
									if (this.transceivers.find(function (e) {
										return e.track === t
									})) throw f("InvalidAccessError", "Track already exists.");
									for (var n = 0; n < this.transceivers.length; n++) this.transceivers[n].track || this.transceivers[n].kind !== t.kind || (i = this.transceivers[n]);
									return i = i || this._createTransceiver(t.kind), this._maybeFireNegotiationNeeded(), -1 === this.localStreams.indexOf(e) && this.localStreams.push(e), i.track = t, i.stream = e, i.rtpSender = new O.RTCRtpSender(t, i.dtlsTransport), i.rtpSender
								}, n.prototype.addStream = function (t) {
									var i = this;
									if (15025 <= D) t.getTracks().forEach(function (e) {
										i.addTrack(e, t)
									});
									else {
										var n = t.clone();
										t.getTracks().forEach(function (e, t) {
											var i = n.getTracks()[t];
											e.addEventListener("enabled", function (e) {
												i.enabled = e.enabled
											})
										}), n.getTracks().forEach(function (e) {
											i.addTrack(e, n)
										})
									}
								}, n.prototype.removeTrack = function (t) {
									if (this._isClosed) throw f("InvalidStateError", "Attempted to call removeTrack on a closed peerconnection.");
									if (!(t instanceof O.RTCRtpSender)) throw new TypeError("Argument 1 of RTCPeerConnection.removeTrack does not implement interface RTCRtpSender.");
									var e = this.transceivers.find(function (e) {
										return e.rtpSender === t
									});
									if (!e) throw f("InvalidAccessError", "Sender was not created by this connection.");
									var i = e.stream;
									e.rtpSender.stop(), e.rtpSender = null, e.track = null, e.stream = null, -1 === this.transceivers.map(function (e) {
										return e.stream
									}).indexOf(i) && -1 < this.localStreams.indexOf(i) && this.localStreams.splice(this.localStreams.indexOf(i), 1), this._maybeFireNegotiationNeeded()
								}, n.prototype.removeStream = function (e) {
									var i = this;
									e.getTracks().forEach(function (t) {
										var e = i.getSenders().find(function (e) {
											return e.track === t
										});
										e && i.removeTrack(e)
									})
								}, n.prototype.getSenders = function () {
									return this.transceivers.filter(function (e) {
										return !!e.rtpSender
									}).map(function (e) {
										return e.rtpSender
									})
								}, n.prototype.getReceivers = function () {
									return this.transceivers.filter(function (e) {
										return !!e.rtpReceiver
									}).map(function (e) {
										return e.rtpReceiver
									})
								}, n.prototype._createIceGatherer = function (i, e) {
									var n = this;
									if (e && 0 < i) return this.transceivers[0].iceGatherer;
									if (this._iceGatherers.length) return this._iceGatherers.shift();
									var r = new O.RTCIceGatherer(
										{
											iceServers: this._config.iceServers,
											gatherPolicy: this._config.iceTransportPolicy
										});
									return Object.defineProperty(r, "state",
										{
											value: "new",
											writable: !0
										}), this.transceivers[i].bufferedCandidateEvents = [], this.transceivers[i].bufferCandidates = function (e) {
											var t = !e.candidate || 0 === Object.keys(e.candidate).length;
											r.state = t ? "completed" : "gathering", null !== n.transceivers[i].bufferedCandidateEvents && n.transceivers[i].bufferedCandidateEvents.push(e)
										}, r.addEventListener("localcandidate", this.transceivers[i].bufferCandidates), r
								}, n.prototype._gather = function (a, c) {
									var l = this,
										d = this.transceivers[c].iceGatherer;
									if (!d.onlocalcandidate) {
										var e = this.transceivers[c].bufferedCandidateEvents;
										this.transceivers[c].bufferedCandidateEvents = null, d.removeEventListener("localcandidate", this.transceivers[c].bufferCandidates), d.onlocalcandidate = function (e) {
											if (!(l.usingBundle && 0 < c)) {
												var t = new Event("icecandidate");
												t.candidate = {
													sdpMid: a,
													sdpMLineIndex: c
												};
												var i = e.candidate,
													n = !i || 0 === Object.keys(i).length;
												if (n) "new" !== d.state && "gathering" !== d.state || (d.state = "completed");
												else {
													"new" === d.state && (d.state = "gathering"), i.component = 1, i.ufrag = d.getLocalParameters().usernameFragment;
													var r = L.writeCandidate(i);
													t.candidate = Object.assign(t.candidate, L.parseCandidate(r)), t.candidate.candidate = r, t.candidate.toJSON = function () {
														return {
															candidate: t.candidate.candidate,
															sdpMid: t.candidate.sdpMid,
															sdpMLineIndex: t.candidate.sdpMLineIndex,
															usernameFragment: t.candidate.usernameFragment
														}
													}
												}
												var o = L.getMediaSections(l._localDescription.sdp);
												o[t.candidate.sdpMLineIndex] += n ? "a=end-of-candidates\r\n" : "a=" + t.candidate.candidate + "\r\n", l._localDescription.sdp = L.getDescription(l._localDescription.sdp) + o.join("");
												var s = l.transceivers.every(function (e) {
													return e.iceGatherer && "completed" === e.iceGatherer.state
												});
												"gathering" !== l.iceGatheringState && (l.iceGatheringState = "gathering", l._emitGatheringStateChange()), n || l._dispatchEvent("icecandidate", t), s && (l._dispatchEvent("icecandidate", new Event("icecandidate")), l.iceGatheringState = "complete", l._emitGatheringStateChange())
											}
										}, O.setTimeout(function () {
											e.forEach(function (e) {
												d.onlocalcandidate(e)
											})
										}, 0)
									}
								}, n.prototype._createIceAndDtlsTransports = function () {
									var e = this,
										t = new O.RTCIceTransport(null);
									t.onicestatechange = function () {
										e._updateIceConnectionState(), e._updateConnectionState()
									};
									var i = new O.RTCDtlsTransport(t);
									return i.ondtlsstatechange = function () {
										e._updateConnectionState()
									}, i.onerror = function () {
										Object.defineProperty(i, "state",
											{
												value: "failed",
												writable: !0
											}), e._updateConnectionState()
									},
									{
										iceTransport: t,
										dtlsTransport: i
									}
								}, n.prototype._disposeIceAndDtlsTransports = function (e) {
									var t = this.transceivers[e].iceGatherer;
									t && (delete t.onlocalcandidate, delete this.transceivers[e].iceGatherer);
									var i = this.transceivers[e].iceTransport;
									i && (delete i.onicestatechange, delete this.transceivers[e].iceTransport);
									var n = this.transceivers[e].dtlsTransport;
									n && (delete n.ondtlsstatechange, delete n.onerror, delete this.transceivers[e].dtlsTransport)
								}, n.prototype._transceive = function (e, t, i) {
									var n = B(e.localCapabilities, e.remoteCapabilities);
									t && e.rtpSender && (n.encodings = e.sendEncodingParameters, n.rtcp = {
										cname: L.localCName,
										compound: e.rtcpParameters.compound
									}, e.recvEncodingParameters.length && (n.rtcp.ssrc = e.recvEncodingParameters[0].ssrc), e.rtpSender.send(n)), i && e.rtpReceiver && 0 < n.codecs.length && ("video" === e.kind && e.recvEncodingParameters && D < 15019 && e.recvEncodingParameters.forEach(function (e) {
										delete e.rtx
									}), e.recvEncodingParameters.length ? n.encodings = e.recvEncodingParameters : n.encodings = [
										{}], n.rtcp = {
											compound: e.rtcpParameters.compound
										}, e.rtcpParameters.cname && (n.rtcp.cname = e.rtcpParameters.cname), e.sendEncodingParameters.length && (n.rtcp.ssrc = e.sendEncodingParameters[0].ssrc), e.rtpReceiver.receive(n))
								}, n.prototype.setLocalDescription = function (e) {
									var t, h, u = this;
									if (-1 === ["offer", "answer"].indexOf(e.type)) return Promise.reject(f("TypeError", 'Unsupported type "' + e.type + '"'));
									if (!o("setLocalDescription", e.type, u.signalingState) || u._isClosed) return Promise.reject(f("InvalidStateError", "Can not set local " + e.type + " in state " + u.signalingState));
									if ("offer" === e.type) t = L.splitSections(e.sdp), h = t.shift(), t.forEach(function (e, t) {
										var i = L.parseRtpParameters(e);
										u.transceivers[t].localCapabilities = i
									}), u.transceivers.forEach(function (e, t) {
										u._gather(e.mid, t)
									});
									else if ("answer" === e.type) {
										t = L.splitSections(u._remoteDescription.sdp), h = t.shift();
										var p = 0 < L.matchPrefix(h, "a=ice-lite").length;
										t.forEach(function (e, t) {
											var i = u.transceivers[t],
												n = i.iceGatherer,
												r = i.iceTransport,
												o = i.dtlsTransport,
												s = i.localCapabilities,
												a = i.remoteCapabilities;
											if (!(L.isRejected(e) && 0 === L.matchPrefix(e, "a=bundle-only").length) && !i.rejected) {
												var c = L.getIceParameters(e, h),
													l = L.getDtlsParameters(e, h);
												p && (l.role = "server"), u.usingBundle && 0 !== t || (u._gather(i.mid, t), "new" === r.state && r.start(n, c, p ? "controlling" : "controlled"), "new" === o.state && o.start(l));
												var d = B(s, a);
												u._transceive(i, 0 < d.codecs.length, !1)
											}
										})
									}
									return u._localDescription = {
										type: e.type,
										sdp: e.sdp
									}, "offer" === e.type ? u._updateSignalingState("have-local-offer") : u._updateSignalingState("stable"), Promise.resolve()
								}, n.prototype.setRemoteDescription = function (w) {
									var R = this;
									if (-1 === ["offer", "answer"].indexOf(w.type)) return Promise.reject(f("TypeError", 'Unsupported type "' + w.type + '"'));
									if (!o("setRemoteDescription", w.type, R.signalingState) || R._isClosed) return Promise.reject(f("InvalidStateError", "Can not set remote " + w.type + " in state " + R.signalingState));
									var x = {};
									R.remoteStreams.forEach(function (e) {
										x[e.id] = e
									});
									var I = [],
										e = L.splitSections(w.sdp),
										A = e.shift(),
										N = 0 < L.matchPrefix(A, "a=ice-lite").length,
										k = 0 < L.matchPrefix(A, "a=group:BUNDLE ").length;
									R.usingBundle = k;
									var t = L.matchPrefix(A, "a=ice-options:")[0];
									return R.canTrickleIceCandidates = !!t && 0 <= t.substr(14).split(" ").indexOf("trickle"), e.forEach(function (e, t) {
										var i = L.splitLines(e),
											n = L.getKind(e),
											r = L.isRejected(e) && 0 === L.matchPrefix(e, "a=bundle-only").length,
											o = i[0].substr(2).split(" ")[2],
											s = L.getDirection(e, A),
											a = L.parseMsid(e),
											c = L.getMid(e) || L.generateIdentifier();
										if (r || "application" === n && ("DTLS/SCTP" === o || "UDP/DTLS/SCTP" === o)) R.transceivers[t] = {
											mid: c,
											kind: n,
											protocol: o,
											rejected: !0
										};
										else {
											var l, d, h, u, p, f, m, v, _;
											!r && R.transceivers[t] && R.transceivers[t].rejected && (R.transceivers[t] = R._createTransceiver(n, !0));
											var y, g, b = L.parseRtpParameters(e);
											r || (y = L.getIceParameters(e, A), (g = L.getDtlsParameters(e, A)).role = "client"), m = L.parseRtpEncodingParameters(e);
											var C = L.parseRtcpParameters(e),
												S = 0 < L.matchPrefix(e, "a=end-of-candidates", A).length,
												P = L.matchPrefix(e, "a=candidate:").map(function (e) {
													return L.parseCandidate(e)
												}).filter(function (e) {
													return 1 === e.component
												});
											if (("offer" === w.type || "answer" === w.type) && !r && k && 0 < t && R.transceivers[t] && (R._disposeIceAndDtlsTransports(t), R.transceivers[t].iceGatherer = R.transceivers[0].iceGatherer, R.transceivers[t].iceTransport = R.transceivers[0].iceTransport, R.transceivers[t].dtlsTransport = R.transceivers[0].dtlsTransport, R.transceivers[t].rtpSender && R.transceivers[t].rtpSender.setTransport(R.transceivers[0].dtlsTransport), R.transceivers[t].rtpReceiver && R.transceivers[t].rtpReceiver.setTransport(R.transceivers[0].dtlsTransport)), "offer" !== w.type || r) {
												if ("answer" === w.type && !r) {
													d = (l = R.transceivers[t]).iceGatherer, h = l.iceTransport, u = l.dtlsTransport, p = l.rtpReceiver, f = l.sendEncodingParameters, v = l.localCapabilities, R.transceivers[t].recvEncodingParameters = m, R.transceivers[t].remoteCapabilities = b, R.transceivers[t].rtcpParameters = C, P.length && "new" === h.state && (!N && !S || k && 0 !== t ? P.forEach(function (e) {
														F(l.iceTransport, e)
													}) : h.setRemoteCandidates(P)), k && 0 !== t || ("new" === h.state && h.start(d, y, "controlling"), "new" === u.state && u.start(g)), !B(l.localCapabilities, l.remoteCapabilities).codecs.filter(function (e) {
														return "rtx" === e.name.toLowerCase()
													}).length && l.sendEncodingParameters[0].rtx && delete l.sendEncodingParameters[0].rtx, R._transceive(l, "sendrecv" === s || "recvonly" === s, "sendrecv" === s || "sendonly" === s), !p || "sendrecv" !== s && "sendonly" !== s ? delete l.rtpReceiver : (_ = p.track, a ? (x[a.stream] || (x[a.stream] = new O.MediaStream), M(_, x[a.stream]), I.push([_, p, x[a.stream]])) : (x.default || (x.default = new O.MediaStream), M(_, x.default), I.push([_, p, x.default])))
												}
											}
											else {
												(l = R.transceivers[t] || R._createTransceiver(n)).mid = c, l.iceGatherer || (l.iceGatherer = R._createIceGatherer(t, k)), P.length && "new" === l.iceTransport.state && (!S || k && 0 !== t ? P.forEach(function (e) {
													F(l.iceTransport, e)
												}) : l.iceTransport.setRemoteCandidates(P)), v = O.RTCRtpReceiver.getCapabilities(n), D < 15019 && (v.codecs = v.codecs.filter(function (e) {
													return "rtx" !== e.name
												})), f = l.sendEncodingParameters || [
													{
														ssrc: 1001 * (2 * t + 2)
													}];
												var E, T = !1;
												if ("sendrecv" === s || "sendonly" === s) {
													if (T = !l.rtpReceiver, p = l.rtpReceiver || new O.RTCRtpReceiver(l.dtlsTransport, n), T) _ = p.track, a && "-" === a.stream || (E = a ? (x[a.stream] || (x[a.stream] = new O.MediaStream, Object.defineProperty(x[a.stream], "id",
														{
															get: function () {
																return a.stream
															}
														})), Object.defineProperty(_, "id",
															{
																get: function () {
																	return a.track
																}
															}), x[a.stream]) : (x.default || (x.default = new O.MediaStream), x.default)), E && (M(_, E), l.associatedRemoteMediaStreams.push(E)), I.push([_, p, E])
												}
												else l.rtpReceiver && l.rtpReceiver.track && (l.associatedRemoteMediaStreams.forEach(function (e) {
													var t = e.getTracks().find(function (e) {
														return e.id === l.rtpReceiver.track.id
													});
													t && function (e, t) {
														t.removeTrack(e), t.dispatchEvent(new O.MediaStreamTrackEvent("removetrack",
															{
																track: e
															}))
													}(t, e)
												}), l.associatedRemoteMediaStreams = []);
												l.localCapabilities = v, l.remoteCapabilities = b, l.rtpReceiver = p, l.rtcpParameters = C, l.sendEncodingParameters = f, l.recvEncodingParameters = m, R._transceive(R.transceivers[t], !1, T)
											}
										}
									}), void 0 === R._dtlsRole && (R._dtlsRole = "offer" === w.type ? "active" : "passive"), R._remoteDescription = {
										type: w.type,
										sdp: w.sdp
									}, "offer" === w.type ? R._updateSignalingState("have-remote-offer") : R._updateSignalingState("stable"), Object.keys(x).forEach(function (e) {
										var n = x[e];
										if (n.getTracks().length) {
											if (-1 === R.remoteStreams.indexOf(n)) {
												R.remoteStreams.push(n);
												var t = new Event("addstream");
												t.stream = n, O.setTimeout(function () {
													R._dispatchEvent("addstream", t)
												})
											}
											I.forEach(function (e) {
												var t = e[0],
													i = e[1];
												n.id === e[2].id && r(R, t, i, [n])
											})
										}
									}), I.forEach(function (e) {
										e[2] || r(R, e[0], e[1], [])
									}), O.setTimeout(function () {
										R && R.transceivers && R.transceivers.forEach(function (e) {
											e.iceTransport && "new" === e.iceTransport.state && 0 < e.iceTransport.getRemoteCandidates().length && (console.warn("Timeout for addRemoteCandidate. Consider sending an end-of-candidates notification"), e.iceTransport.addRemoteCandidate(
												{}))
										})
									}, 4e3), Promise.resolve()
								}, n.prototype.close = function () {
									this.transceivers.forEach(function (e) {
										e.iceTransport && e.iceTransport.stop(), e.dtlsTransport && e.dtlsTransport.stop(), e.rtpSender && e.rtpSender.stop(), e.rtpReceiver && e.rtpReceiver.stop()
									}), this._isClosed = !0, this._updateSignalingState("closed")
								}, n.prototype._updateSignalingState = function (e) {
									this.signalingState = e;
									var t = new Event("signalingstatechange");
									this._dispatchEvent("signalingstatechange", t)
								}, n.prototype._maybeFireNegotiationNeeded = function () {
									var t = this;
									"stable" === this.signalingState && !0 !== this.needNegotiation && (this.needNegotiation = !0, O.setTimeout(function () {
										if (t.needNegotiation) {
											t.needNegotiation = !1;
											var e = new Event("negotiationneeded");
											t._dispatchEvent("negotiationneeded", e)
										}
									}, 0))
								}, n.prototype._updateIceConnectionState = function () {
									var e, t = {
										new: 0,
										closed: 0,
										checking: 0,
										connected: 0,
										completed: 0,
										disconnected: 0,
										failed: 0
									};
									if (this.transceivers.forEach(function (e) {
										t[e.iceTransport.state]++
									}), e = "new", 0 < t.failed ? e = "failed" : 0 < t.checking ? e = "checking" : 0 < t.disconnected ? e = "disconnected" : 0 < t.new ? e = "new" : 0 < t.connected ? e = "connected" : 0 < t.completed && (e = "completed"), e !== this.iceConnectionState) {
										this.iceConnectionState = e;
										var i = new Event("iceconnectionstatechange");
										this._dispatchEvent("iceconnectionstatechange", i)
									}
								}, n.prototype._updateConnectionState = function () {
									var e, t = {
										new: 0,
										closed: 0,
										connecting: 0,
										connected: 0,
										completed: 0,
										disconnected: 0,
										failed: 0
									};
									if (this.transceivers.forEach(function (e) {
										t[e.iceTransport.state]++, t[e.dtlsTransport.state]++
									}), t.connected += t.completed, e = "new", 0 < t.failed ? e = "failed" : 0 < t.connecting ? e = "connecting" : 0 < t.disconnected ? e = "disconnected" : 0 < t.new ? e = "new" : 0 < t.connected && (e = "connected"), e !== this.connectionState) {
										this.connectionState = e;
										var i = new Event("connectionstatechange");
										this._dispatchEvent("connectionstatechange", i)
									}
								}, n.prototype.createOffer = function () {
									var a = this;
									if (a._isClosed) return Promise.reject(f("InvalidStateError", "Can not call createOffer after close"));
									var t = a.transceivers.filter(function (e) {
										return "audio" === e.kind
									}).length,
										i = a.transceivers.filter(function (e) {
											return "video" === e.kind
										}).length,
										e = arguments[0];
									if (e) {
										if (e.mandatory || e.optional) throw new TypeError("Legacy mandatory/optional constraints not supported.");
										void 0 !== e.offerToReceiveAudio && (t = !0 === e.offerToReceiveAudio ? 1 : !1 === e.offerToReceiveAudio ? 0 : e.offerToReceiveAudio), void 0 !== e.offerToReceiveVideo && (i = !0 === e.offerToReceiveVideo ? 1 : !1 === e.offerToReceiveVideo ? 0 : e.offerToReceiveVideo)
									}
									for (a.transceivers.forEach(function (e) {
										"audio" === e.kind ? --t < 0 && (e.wantReceive = !1) : "video" === e.kind && --i < 0 && (e.wantReceive = !1)
									}); 0 < t || 0 < i;) 0 < t && (a._createTransceiver("audio"), t--), 0 < i && (a._createTransceiver("video"), i--);
									var n = L.writeSessionBoilerplate(a._sdpSessionId, a._sdpSessionVersion++);
									a.transceivers.forEach(function (e, t) {
										var i = e.track,
											n = e.kind,
											r = e.mid || L.generateIdentifier();
										e.mid = r, e.iceGatherer || (e.iceGatherer = a._createIceGatherer(t, a.usingBundle));
										var o = O.RTCRtpSender.getCapabilities(n);
										D < 15019 && (o.codecs = o.codecs.filter(function (e) {
											return "rtx" !== e.name
										})), o.codecs.forEach(function (t) {
											"H264" === t.name && void 0 === t.parameters["level-asymmetry-allowed"] && (t.parameters["level-asymmetry-allowed"] = "1"), e.remoteCapabilities && e.remoteCapabilities.codecs && e.remoteCapabilities.codecs.forEach(function (e) {
												t.name.toLowerCase() === e.name.toLowerCase() && t.clockRate === e.clockRate && (t.preferredPayloadType = e.payloadType)
											})
										}), o.headerExtensions.forEach(function (t) {
											(e.remoteCapabilities && e.remoteCapabilities.headerExtensions || []).forEach(function (e) {
												t.uri === e.uri && (t.id = e.id)
											})
										});
										var s = e.sendEncodingParameters || [
											{
												ssrc: 1001 * (2 * t + 1)
											}];
										i && 15019 <= D && "video" === n && !s[0].rtx && (s[0].rtx = {
											ssrc: s[0].ssrc + 1
										}), e.wantReceive && (e.rtpReceiver = new O.RTCRtpReceiver(e.dtlsTransport, n)), e.localCapabilities = o, e.sendEncodingParameters = s
									}), "max-compat" !== a._config.bundlePolicy && (n += "a=group:BUNDLE " + a.transceivers.map(function (e) {
										return e.mid
									}).join(" ") + "\r\n"), n += "a=ice-options:trickle\r\n", a.transceivers.forEach(function (e, t) {
										n += c(e, e.localCapabilities, "offer", e.stream, a._dtlsRole), n += "a=rtcp-rsize\r\n", !e.iceGatherer || "new" === a.iceGatheringState || 0 !== t && a.usingBundle || (e.iceGatherer.getLocalCandidates().forEach(function (e) {
											e.component = 1, n += "a=" + L.writeCandidate(e) + "\r\n"
										}), "completed" === e.iceGatherer.state && (n += "a=end-of-candidates\r\n"))
									});
									var r = new O.RTCSessionDescription(
										{
											type: "offer",
											sdp: n
										});
									return Promise.resolve(r)
								}, n.prototype.createAnswer = function () {
									var r = this;
									if (r._isClosed) return Promise.reject(f("InvalidStateError", "Can not call createAnswer after close"));
									if ("have-remote-offer" !== r.signalingState && "have-local-pranswer" !== r.signalingState) return Promise.reject(f("InvalidStateError", "Can not call createAnswer in signalingState " + r.signalingState));
									var o = L.writeSessionBoilerplate(r._sdpSessionId, r._sdpSessionVersion++);
									r.usingBundle && (o += "a=group:BUNDLE " + r.transceivers.map(function (e) {
										return e.mid
									}).join(" ") + "\r\n"), o += "a=ice-options:trickle\r\n";
									var s = L.getMediaSections(r._remoteDescription.sdp).length;
									r.transceivers.forEach(function (e, t) {
										if (!(s < t + 1)) {
											if (e.rejected) return "application" === e.kind ? "DTLS/SCTP" === e.protocol ? o += "m=application 0 DTLS/SCTP 5000\r\n" : o += "m=application 0 " + e.protocol + " webrtc-datachannel\r\n" : "audio" === e.kind ? o += "m=audio 0 UDP/TLS/RTP/SAVPF 0\r\na=rtpmap:0 PCMU/8000\r\n" : "video" === e.kind && (o += "m=video 0 UDP/TLS/RTP/SAVPF 120\r\na=rtpmap:120 VP8/90000\r\n"), void (o += "c=IN IP4 0.0.0.0\r\na=inactive\r\na=mid:" + e.mid + "\r\n");
											var i;
											if (e.stream) "audio" === e.kind ? i = e.stream.getAudioTracks()[0] : "video" === e.kind && (i = e.stream.getVideoTracks()[0]), i && 15019 <= D && "video" === e.kind && !e.sendEncodingParameters[0].rtx && (e.sendEncodingParameters[0].rtx = {
												ssrc: e.sendEncodingParameters[0].ssrc + 1
											});
											var n = B(e.localCapabilities, e.remoteCapabilities);
											!n.codecs.filter(function (e) {
												return "rtx" === e.name.toLowerCase()
											}).length && e.sendEncodingParameters[0].rtx && delete e.sendEncodingParameters[0].rtx, o += c(e, n, "answer", e.stream, r._dtlsRole), e.rtcpParameters && e.rtcpParameters.reducedSize && (o += "a=rtcp-rsize\r\n")
										}
									});
									var e = new O.RTCSessionDescription(
										{
											type: "answer",
											sdp: o
										});
									return Promise.resolve(e)
								}, n.prototype.addIceCandidate = function (c) {
									var l, d = this;
									return c && void 0 === c.sdpMLineIndex && !c.sdpMid ? Promise.reject(new TypeError("sdpMLineIndex or sdpMid required")) : new Promise(function (e, t) {
										if (!d._remoteDescription) return t(f("InvalidStateError", "Can not add ICE candidate without a remote description"));
										if (c && "" !== c.candidate) {
											var i = c.sdpMLineIndex;
											if (c.sdpMid)
												for (var n = 0; n < d.transceivers.length; n++)
													if (d.transceivers[n].mid === c.sdpMid) {
														i = n;
														break
													} var r = d.transceivers[i];
											if (!r) return t(f("OperationError", "Can not add ICE candidate"));
											if (r.rejected) return e();
											var o = 0 < Object.keys(c.candidate).length ? L.parseCandidate(c.candidate) :
												{};
											if ("tcp" === o.protocol && (0 === o.port || 9 === o.port)) return e();
											if (o.component && 1 !== o.component) return e();
											if ((0 === i || 0 < i && r.iceTransport !== d.transceivers[0].iceTransport) && !F(r.iceTransport, o)) return t(f("OperationError", "Can not add ICE candidate"));
											var s = c.candidate.trim();
											0 === s.indexOf("a=") && (s = s.substr(2)), (l = L.getMediaSections(d._remoteDescription.sdp))[i] += "a=" + (o.type ? s : "end-of-candidates") + "\r\n", d._remoteDescription.sdp = L.getDescription(d._remoteDescription.sdp) + l.join("")
										}
										else
											for (var a = 0; a < d.transceivers.length && (d.transceivers[a].rejected || (d.transceivers[a].iceTransport.addRemoteCandidate(
												{}), (l = L.getMediaSections(d._remoteDescription.sdp))[a] += "a=end-of-candidates\r\n", d._remoteDescription.sdp = L.getDescription(d._remoteDescription.sdp) + l.join(""), !d.usingBundle)); a++);
										e()
									})
								}, n.prototype.getStats = function (t) {
									if (t && t instanceof O.MediaStreamTrack) {
										var i = null;
										if (this.transceivers.forEach(function (e) {
											e.rtpSender && e.rtpSender.track === t ? i = e.rtpSender : e.rtpReceiver && e.rtpReceiver.track === t && (i = e.rtpReceiver)
										}), !i) throw f("InvalidAccessError", "Invalid selector.");
										return i.getStats()
									}
									var n = [];
									return this.transceivers.forEach(function (t) {
										["rtpSender", "rtpReceiver", "iceGatherer", "iceTransport", "dtlsTransport"].forEach(function (e) {
											t[e] && n.push(t[e].getStats())
										})
									}), Promise.all(n).then(function (e) {
										var t = new Map;
										return e.forEach(function (e) {
											e.forEach(function (e) {
												t.set(e.id, e)
											})
										}), t
									})
								};
						["RTCRtpSender", "RTCRtpReceiver", "RTCIceGatherer", "RTCIceTransport", "RTCDtlsTransport"].forEach(function (e) {
							var t = O[e];
							if (t && t.prototype && t.prototype.getStats) {
								var i = t.prototype.getStats;
								t.prototype.getStats = function () {
									return i.apply(this).then(function (t) {
										var i = new Map;
										return Object.keys(t).forEach(function (e) {
											t[e].type = function (e) {
												return {
													inboundrtp: "inbound-rtp",
													outboundrtp: "outbound-rtp",
													candidatepair: "candidate-pair",
													localcandidate: "local-candidate",
													remotecandidate: "remote-candidate"
												}[e.type] || e.type
											}(t[e]), i.set(e, t[e])
										}), i
									})
								}
							}
						});
						var e = ["createOffer", "createAnswer"];
						return e.forEach(function (e) {
							var i = n.prototype[e];
							n.prototype[e] = function () {
								var t = arguments;
								return "function" == typeof t[0] || "function" == typeof t[1] ? i.apply(this, [arguments[2]]).then(function (e) {
									"function" == typeof t[0] && t[0].apply(null, [e])
								}, function (e) {
									"function" == typeof t[1] && t[1].apply(null, [e])
								}) : i.apply(this, arguments)
							}
						}), (e = ["setLocalDescription", "setRemoteDescription", "addIceCandidate"]).forEach(function (e) {
							var i = n.prototype[e];
							n.prototype[e] = function () {
								var t = arguments;
								return "function" == typeof t[1] || "function" == typeof t[2] ? i.apply(this, arguments).then(function () {
									"function" == typeof t[1] && t[1].apply(null)
								}, function (e) {
									"function" == typeof t[2] && t[2].apply(null, [e])
								}) : i.apply(this, arguments)
							}
						}), ["getStats"].forEach(function (e) {
							var t = n.prototype[e];
							n.prototype[e] = function () {
								var e = arguments;
								return "function" == typeof e[1] ? t.apply(this, arguments).then(function () {
									"function" == typeof e[1] && e[1].apply(null)
								}) : t.apply(this, arguments)
							}
						}), n
					}
				},
				{
					sdp: 2
				}],
				2: [function (e, t, i) {
					"use strict";
					var d = {
						generateIdentifier: function () {
							return Math.random().toString(36).substr(2, 10)
						}
					};
					d.localCName = d.generateIdentifier(), d.splitLines = function (e) {
						return e.trim().split("\n").map(function (e) {
							return e.trim()
						})
					}, d.splitSections = function (e) {
						return e.split("\nm=").map(function (e, t) {
							return (0 < t ? "m=" + e : e).trim() + "\r\n"
						})
					}, d.getDescription = function (e) {
						var t = d.splitSections(e);
						return t && t[0]
					}, d.getMediaSections = function (e) {
						var t = d.splitSections(e);
						return t.shift(), t
					}, d.matchPrefix = function (e, t) {
						return d.splitLines(e).filter(function (e) {
							return 0 === e.indexOf(t)
						})
					}, d.parseCandidate = function (e) {
						for (var t, i = {
							foundation: (t = 0 === e.indexOf("a=candidate:") ? e.substring(12).split(" ") : e.substring(10).split(" "))[0],
							component: parseInt(t[1], 10),
							protocol: t[2].toLowerCase(),
							priority: parseInt(t[3], 10),
							ip: t[4],
							address: t[4],
							port: parseInt(t[5], 10),
							type: t[7]
						}, n = 8; n < t.length; n += 2) switch (t[n]) {
								case "raddr":
									i.relatedAddress = t[n + 1];
									break;
								case "rport":
									i.relatedPort = parseInt(t[n + 1], 10);
									break;
								case "tcptype":
									i.tcpType = t[n + 1];
									break;
								case "ufrag":
									i.ufrag = t[n + 1], i.usernameFragment = t[n + 1];
									break;
								default:
									i[t[n]] = t[n + 1]
							}
						return i
					}, d.writeCandidate = function (e) {
						var t = [];
						t.push(e.foundation), t.push(e.component), t.push(e.protocol.toUpperCase()), t.push(e.priority), t.push(e.address || e.ip), t.push(e.port);
						var i = e.type;
						return t.push("typ"), t.push(i), "host" !== i && e.relatedAddress && e.relatedPort && (t.push("raddr"), t.push(e.relatedAddress), t.push("rport"), t.push(e.relatedPort)), e.tcpType && "tcp" === e.protocol.toLowerCase() && (t.push("tcptype"), t.push(e.tcpType)), (e.usernameFragment || e.ufrag) && (t.push("ufrag"), t.push(e.usernameFragment || e.ufrag)), "candidate:" + t.join(" ")
					}, d.parseIceOptions = function (e) {
						return e.substr(14).split(" ")
					}, d.parseRtpMap = function (e) {
						var t = e.substr(9).split(" "),
							i = {
								payloadType: parseInt(t.shift(), 10)
							};
						return t = t[0].split("/"), i.name = t[0], i.clockRate = parseInt(t[1], 10), i.channels = 3 === t.length ? parseInt(t[2], 10) : 1, i.numChannels = i.channels, i
					}, d.writeRtpMap = function (e) {
						var t = e.payloadType;
						void 0 !== e.preferredPayloadType && (t = e.preferredPayloadType);
						var i = e.channels || e.numChannels || 1;
						return "a=rtpmap:" + t + " " + e.name + "/" + e.clockRate + (1 !== i ? "/" + i : "") + "\r\n"
					}, d.parseExtmap = function (e) {
						var t = e.substr(9).split(" ");
						return {
							id: parseInt(t[0], 10),
							direction: 0 < t[0].indexOf("/") ? t[0].split("/")[1] : "sendrecv",
							uri: t[1]
						}
					}, d.writeExtmap = function (e) {
						return "a=extmap:" + (e.id || e.preferredId) + (e.direction && "sendrecv" !== e.direction ? "/" + e.direction : "") + " " + e.uri + "\r\n"
					}, d.parseFmtp = function (e) {
						for (var t, i = {}, n = e.substr(e.indexOf(" ") + 1).split(";"), r = 0; r < n.length; r++) i[(t = n[r].trim().split("="))[0].trim()] = t[1];
						return i
					}, d.writeFmtp = function (t) {
						var e = "",
							i = t.payloadType;
						if (void 0 !== t.preferredPayloadType && (i = t.preferredPayloadType), t.parameters && Object.keys(t.parameters).length) {
							var n = [];
							Object.keys(t.parameters).forEach(function (e) {
								t.parameters[e] ? n.push(e + "=" + t.parameters[e]) : n.push(e)
							}), e += "a=fmtp:" + i + " " + n.join(";") + "\r\n"
						}
						return e
					}, d.parseRtcpFb = function (e) {
						var t = e.substr(e.indexOf(" ") + 1).split(" ");
						return {
							type: t.shift(),
							parameter: t.join(" ")
						}
					}, d.writeRtcpFb = function (e) {
						var t = "",
							i = e.payloadType;
						return void 0 !== e.preferredPayloadType && (i = e.preferredPayloadType), e.rtcpFeedback && e.rtcpFeedback.length && e.rtcpFeedback.forEach(function (e) {
							t += "a=rtcp-fb:" + i + " " + e.type + (e.parameter && e.parameter.length ? " " + e.parameter : "") + "\r\n"
						}), t
					}, d.parseSsrcMedia = function (e) {
						var t = e.indexOf(" "),
							i = {
								ssrc: parseInt(e.substr(7, t - 7), 10)
							},
							n = e.indexOf(":", t);
						return -1 < n ? (i.attribute = e.substr(t + 1, n - t - 1), i.value = e.substr(n + 1)) : i.attribute = e.substr(t + 1), i
					}, d.parseSsrcGroup = function (e) {
						var t = e.substr(13).split(" ");
						return {
							semantics: t.shift(),
							ssrcs: t.map(function (e) {
								return parseInt(e, 10)
							})
						}
					}, d.getMid = function (e) {
						var t = d.matchPrefix(e, "a=mid:")[0];
						if (t) return t.substr(6)
					}, d.parseFingerprint = function (e) {
						var t = e.substr(14).split(" ");
						return {
							algorithm: t[0].toLowerCase(),
							value: t[1]
						}
					}, d.getDtlsParameters = function (e, t) {
						return {
							role: "auto",
							fingerprints: d.matchPrefix(e + t, "a=fingerprint:").map(d.parseFingerprint)
						}
					}, d.writeDtlsParameters = function (e, t) {
						var i = "a=setup:" + t + "\r\n";
						return e.fingerprints.forEach(function (e) {
							i += "a=fingerprint:" + e.algorithm + " " + e.value + "\r\n"
						}), i
					}, d.getIceParameters = function (e, t) {
						var i = d.splitLines(e);
						return {
							usernameFragment: (i = i.concat(d.splitLines(t))).filter(function (e) {
								return 0 === e.indexOf("a=ice-ufrag:")
							})[0].substr(12),
							password: i.filter(function (e) {
								return 0 === e.indexOf("a=ice-pwd:")
							})[0].substr(10)
						}
					}, d.writeIceParameters = function (e) {
						return "a=ice-ufrag:" + e.usernameFragment + "\r\na=ice-pwd:" + e.password + "\r\n"
					}, d.parseRtpParameters = function (e) {
						for (var t = {
							codecs: [],
							headerExtensions: [],
							fecMechanisms: [],
							rtcp: []
						}, i = d.splitLines(e)[0].split(" "), n = 3; n < i.length; n++) {
							var r = i[n],
								o = d.matchPrefix(e, "a=rtpmap:" + r + " ")[0];
							if (o) {
								var s = d.parseRtpMap(o),
									a = d.matchPrefix(e, "a=fmtp:" + r + " ");
								switch (s.parameters = a.length ? d.parseFmtp(a[0]) :
									{}, s.rtcpFeedback = d.matchPrefix(e, "a=rtcp-fb:" + r + " ").map(d.parseRtcpFb), t.codecs.push(s), s.name.toUpperCase()) {
									case "RED":
									case "ULPFEC":
										t.fecMechanisms.push(s.name.toUpperCase())
								}
							}
						}
						return d.matchPrefix(e, "a=extmap:").forEach(function (e) {
							t.headerExtensions.push(d.parseExtmap(e))
						}), t
					}, d.writeRtpDescription = function (e, t) {
						var i = "";
						i += "m=" + e + " ", i += 0 < t.codecs.length ? "9" : "0", i += " UDP/TLS/RTP/SAVPF ", i += t.codecs.map(function (e) {
							return void 0 !== e.preferredPayloadType ? e.preferredPayloadType : e.payloadType
						}).join(" ") + "\r\n", i += "c=IN IP4 0.0.0.0\r\n", i += "a=rtcp:9 IN IP4 0.0.0.0\r\n", t.codecs.forEach(function (e) {
							i += d.writeRtpMap(e), i += d.writeFmtp(e), i += d.writeRtcpFb(e)
						});
						var n = 0;
						return t.codecs.forEach(function (e) {
							e.maxptime > n && (n = e.maxptime)
						}), 0 < n && (i += "a=maxptime:" + n + "\r\n"), i += "a=rtcp-mux\r\n", t.headerExtensions && t.headerExtensions.forEach(function (e) {
							i += d.writeExtmap(e)
						}), i
					}, d.parseRtpEncodingParameters = function (e) {
						var i, n = [],
							t = d.parseRtpParameters(e),
							r = -1 !== t.fecMechanisms.indexOf("RED"),
							o = -1 !== t.fecMechanisms.indexOf("ULPFEC"),
							s = d.matchPrefix(e, "a=ssrc:").map(function (e) {
								return d.parseSsrcMedia(e)
							}).filter(function (e) {
								return "cname" === e.attribute
							}),
							a = 0 < s.length && s[0].ssrc,
							c = d.matchPrefix(e, "a=ssrc-group:FID").map(function (e) {
								return e.substr(17).split(" ").map(function (e) {
									return parseInt(e, 10)
								})
							});
						0 < c.length && 1 < c[0].length && c[0][0] === a && (i = c[0][1]), t.codecs.forEach(function (e) {
							if ("RTX" === e.name.toUpperCase() && e.parameters.apt) {
								var t = {
									ssrc: a,
									codecPayloadType: parseInt(e.parameters.apt, 10)
								};
								a && i && (t.rtx = {
									ssrc: i
								}), n.push(t), r && ((t = JSON.parse(JSON.stringify(t))).fec = {
									ssrc: a,
									mechanism: o ? "red+ulpfec" : "red"
								}, n.push(t))
							}
						}), 0 === n.length && a && n.push(
							{
								ssrc: a
							});
						var l = d.matchPrefix(e, "b=");
						return l.length && (l = 0 === l[0].indexOf("b=TIAS:") ? parseInt(l[0].substr(7), 10) : 0 === l[0].indexOf("b=AS:") ? 1e3 * parseInt(l[0].substr(5), 10) * .95 - 16e3 : void 0, n.forEach(function (e) {
							e.maxBitrate = l
						})), n
					}, d.parseRtcpParameters = function (e) {
						var t = {},
							i = d.matchPrefix(e, "a=ssrc:").map(function (e) {
								return d.parseSsrcMedia(e)
							}).filter(function (e) {
								return "cname" === e.attribute
							})[0];
						i && (t.cname = i.value, t.ssrc = i.ssrc);
						var n = d.matchPrefix(e, "a=rtcp-rsize");
						t.reducedSize = 0 < n.length, t.compound = 0 === n.length;
						var r = d.matchPrefix(e, "a=rtcp-mux");
						return t.mux = 0 < r.length, t
					}, d.parseMsid = function (e) {
						var t, i = d.matchPrefix(e, "a=msid:");
						if (1 === i.length) return {
							stream: (t = i[0].substr(7).split(" "))[0],
							track: t[1]
						};
						var n = d.matchPrefix(e, "a=ssrc:").map(function (e) {
							return d.parseSsrcMedia(e)
						}).filter(function (e) {
							return "msid" === e.attribute
						});
						return 0 < n.length ?
							{
								stream: (t = n[0].value.split(" "))[0],
								track: t[1]
							} : void 0
					}, d.generateSessionId = function () {
						return Math.random().toString().substr(2, 21)
					}, d.writeSessionBoilerplate = function (e, t, i) {
						var n = void 0 !== t ? t : 2;
						return "v=0\r\no=" + (i || "thisisadapterortc") + " " + (e || d.generateSessionId()) + " " + n + " IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n"
					}, d.writeMediaSection = function (e, t, i, n) {
						var r = d.writeRtpDescription(e.kind, t);
						if (r += d.writeIceParameters(e.iceGatherer.getLocalParameters()), r += d.writeDtlsParameters(e.dtlsTransport.getLocalParameters(), "offer" === i ? "actpass" : "active"), r += "a=mid:" + e.mid + "\r\n", e.direction ? r += "a=" + e.direction + "\r\n" : e.rtpSender && e.rtpReceiver ? r += "a=sendrecv\r\n" : e.rtpSender ? r += "a=sendonly\r\n" : e.rtpReceiver ? r += "a=recvonly\r\n" : r += "a=inactive\r\n", e.rtpSender) {
							var o = "msid:" + n.id + " " + e.rtpSender.track.id + "\r\n";
							r += "a=" + o, r += "a=ssrc:" + e.sendEncodingParameters[0].ssrc + " " + o, e.sendEncodingParameters[0].rtx && (r += "a=ssrc:" + e.sendEncodingParameters[0].rtx.ssrc + " " + o, r += "a=ssrc-group:FID " + e.sendEncodingParameters[0].ssrc + " " + e.sendEncodingParameters[0].rtx.ssrc + "\r\n")
						}
						return r += "a=ssrc:" + e.sendEncodingParameters[0].ssrc + " cname:" + d.localCName + "\r\n", e.rtpSender && e.sendEncodingParameters[0].rtx && (r += "a=ssrc:" + e.sendEncodingParameters[0].rtx.ssrc + " cname:" + d.localCName + "\r\n"), r
					}, d.getDirection = function (e, t) {
						for (var i = d.splitLines(e), n = 0; n < i.length; n++) switch (i[n]) {
								case "a=sendrecv":
								case "a=sendonly":
								case "a=recvonly":
								case "a=inactive":
									return i[n].substr(2)
							}
						return t ? d.getDirection(t) : "sendrecv"
					}, d.getKind = function (e) {
						return d.splitLines(e)[0].split(" ")[0].substr(2)
					}, d.isRejected = function (e) {
						return "0" === e.split(" ", 2)[1]
					}, d.parseMLine = function (e) {
						var t = d.splitLines(e)[0].substr(2).split(" ");
						return {
							kind: t[0],
							port: parseInt(t[1], 10),
							protocol: t[2],
							fmt: t.slice(3).join(" ")
						}
					}, d.parseOLine = function (e) {
						var t = d.matchPrefix(e, "o=")[0].substr(2).split(" ");
						return {
							username: t[0],
							sessionId: t[1],
							sessionVersion: parseInt(t[2], 10),
							netType: t[3],
							addressType: t[4],
							address: t[5]
						}
					}, d.isValidSDP = function (e) {
						if ("string" != typeof e || 0 === e.length) return !1;
						for (var t = d.splitLines(e), i = 0; i < t.length; i++)
							if (t[i].length < 2 || "=" !== t[i].charAt(1)) return !1;
						return !0
					}, "object" == typeof t && (t.exports = d)
				},
				{}],
				3: [function (i, n, e) {
					(function (e) {
						"use strict";
						var t = i("./adapter_factory.js");
						n.exports = t(
							{
								window: e.window
							})
					}).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window :
						{})
				},
				{
					"./adapter_factory.js": 4
				}],
				4: [function (p, e, t) {
					"use strict";
					var f = p("./utils");
					e.exports = function (e, t) {
						var i = e && e.window,
							n = {
								shimChrome: !0,
								shimFirefox: !0,
								shimEdge: !0,
								shimSafari: !0
							};
						for (var r in t) hasOwnProperty.call(t, r) && (n[r] = t[r]);
						var o = f.log,
							s = f.detectBrowser(i),
							a = p("./chrome/chrome_shim") || null,
							c = p("./edge/edge_shim") || null,
							l = p("./firefox/firefox_shim") || null,
							d = p("./safari/safari_shim") || null,
							h = p("./common_shim") || null,
							u = {
								browserDetails: s,
								commonShim: h,
								extractVersion: f.extractVersion,
								disableLog: f.disableLog,
								disableWarnings: f.disableWarnings
							};
						switch (s.browser) {
							case "chrome":
								if (!a || !a.shimPeerConnection || !n.shimChrome) return o("Chrome shim is not included in this adapter release."), u;
								o("adapter.js shimming chrome."), u.browserShim = a, h.shimCreateObjectURL(i), a.shimGetUserMedia(i), a.shimMediaStream(i), a.shimSourceObject(i), a.shimPeerConnection(i), a.shimOnTrack(i), a.shimAddTrackRemoveTrack(i), a.shimGetSendersWithDtmf(i), a.shimSenderReceiverGetStats(i), a.fixNegotiationNeeded(i), h.shimRTCIceCandidate(i), h.shimMaxMessageSize(i), h.shimSendThrowTypeError(i);
								break;
							case "firefox":
								if (!l || !l.shimPeerConnection || !n.shimFirefox) return o("Firefox shim is not included in this adapter release."), u;
								o("adapter.js shimming firefox."), u.browserShim = l, h.shimCreateObjectURL(i), l.shimGetUserMedia(i), l.shimSourceObject(i), l.shimPeerConnection(i), l.shimOnTrack(i), l.shimRemoveStream(i), l.shimSenderGetStats(i), l.shimReceiverGetStats(i), l.shimRTCDataChannel(i), h.shimRTCIceCandidate(i), h.shimMaxMessageSize(i), h.shimSendThrowTypeError(i);
								break;
							case "edge":
								if (!c || !c.shimPeerConnection || !n.shimEdge) return o("MS edge shim is not included in this adapter release."), u;
								o("adapter.js shimming edge."), u.browserShim = c, h.shimCreateObjectURL(i), c.shimGetUserMedia(i), c.shimPeerConnection(i), c.shimReplaceTrack(i), c.shimGetDisplayMedia(i), h.shimMaxMessageSize(i), h.shimSendThrowTypeError(i);
								break;
							case "safari":
								if (!d || !n.shimSafari) return o("Safari shim is not included in this adapter release."), u;
								o("adapter.js shimming safari."), u.browserShim = d, h.shimCreateObjectURL(i), d.shimRTCIceServerUrls(i), d.shimCreateOfferLegacy(i), d.shimCallbacksAPI(i), d.shimLocalStreamsAPI(i), d.shimRemoteStreamsAPI(i), d.shimTrackEventTransceiver(i), d.shimGetUserMedia(i), h.shimRTCIceCandidate(i), h.shimMaxMessageSize(i), h.shimSendThrowTypeError(i);
								break;
							default:
								o("Unsupported browser!")
						}
						return u
					}
				},
				{
					"./chrome/chrome_shim": 5,
					"./common_shim": 7,
					"./edge/edge_shim": 8,
					"./firefox/firefox_shim": 11,
					"./safari/safari_shim": 13,
					"./utils": 14
				}],
				5: [function (e, t, i) {
					"use strict";
					var c = e("../utils.js"),
						n = c.log;

					function r(i, t, e) {
						var n = e ? "outbound-rtp" : "inbound-rtp",
							r = new Map;
						if (null === t) return r;
						var o = [];
						return i.forEach(function (e) {
							"track" === e.type && e.trackIdentifier === t.id && o.push(e)
						}), o.forEach(function (t) {
							i.forEach(function (e) {
								e.type === n && e.trackId === t.id && ! function t(i, n, r) {
									n && !r.has(n.id) && (r.set(n.id, n), Object.keys(n).forEach(function (e) {
										e.endsWith("Id") ? t(i, i.get(n[e]), r) : e.endsWith("Ids") && n[e].forEach(function (e) {
											t(i, i.get(e), r)
										})
									}))
								}(i, e, r)
							})
						}), r
					}
					t.exports = {
						shimGetUserMedia: e("./getusermedia"),
						shimMediaStream: function (e) {
							e.MediaStream = e.MediaStream || e.webkitMediaStream
						},
						shimOnTrack: function (o) {
							if ("object" != typeof o || !o.RTCPeerConnection || "ontrack" in o.RTCPeerConnection.prototype) c.wrapPeerConnectionEvent(o, "track", function (e) {
								return e.transceiver || Object.defineProperty(e, "transceiver",
									{
										value:
										{
											receiver: e.receiver
										}
									}), e
							});
							else {
								Object.defineProperty(o.RTCPeerConnection.prototype, "ontrack",
									{
										get: function () {
											return this._ontrack
										},
										set: function (e) {
											this._ontrack && this.removeEventListener("track", this._ontrack), this.addEventListener("track", this._ontrack = e)
										},
										enumerable: !0,
										configurable: !0
									});
								var e = o.RTCPeerConnection.prototype.setRemoteDescription;
								o.RTCPeerConnection.prototype.setRemoteDescription = function () {
									var r = this;
									return r._ontrackpoly || (r._ontrackpoly = function (n) {
										n.stream.addEventListener("addtrack", function (t) {
											var e;
											e = o.RTCPeerConnection.prototype.getReceivers ? r.getReceivers().find(function (e) {
												return e.track && e.track.id === t.track.id
											}) :
												{
													track: t.track
												};
											var i = new Event("track");
											i.track = t.track, i.receiver = e, i.transceiver = {
												receiver: e
											}, i.streams = [n.stream], r.dispatchEvent(i)
										}), n.stream.getTracks().forEach(function (t) {
											var e;
											e = o.RTCPeerConnection.prototype.getReceivers ? r.getReceivers().find(function (e) {
												return e.track && e.track.id === t.id
											}) :
												{
													track: t
												};
											var i = new Event("track");
											i.track = t, i.receiver = e, i.transceiver = {
												receiver: e
											}, i.streams = [n.stream], r.dispatchEvent(i)
										})
									}, r.addEventListener("addstream", r._ontrackpoly)), e.apply(r, arguments)
								}
							}
						},
						shimGetSendersWithDtmf: function (e) {
							if ("object" == typeof e && e.RTCPeerConnection && !("getSenders" in e.RTCPeerConnection.prototype) && "createDTMFSender" in e.RTCPeerConnection.prototype) {
								var n = function (e, t) {
									return {
										track: t,
										get dtmf() {
											return void 0 === this._dtmf && ("audio" === t.kind ? this._dtmf = e.createDTMFSender(t) : this._dtmf = null), this._dtmf
										},
										_pc: e
									}
								};
								if (!e.RTCPeerConnection.prototype.getSenders) {
									e.RTCPeerConnection.prototype.getSenders = function () {
										return this._senders = this._senders || [], this._senders.slice()
									};
									var r = e.RTCPeerConnection.prototype.addTrack;
									e.RTCPeerConnection.prototype.addTrack = function (e, t) {
										var i = r.apply(this, arguments);
										return i || (i = n(this, e), this._senders.push(i)), i
									};
									var i = e.RTCPeerConnection.prototype.removeTrack;
									e.RTCPeerConnection.prototype.removeTrack = function (e) {
										i.apply(this, arguments);
										var t = this._senders.indexOf(e); - 1 !== t && this._senders.splice(t, 1)
									}
								}
								var o = e.RTCPeerConnection.prototype.addStream;
								e.RTCPeerConnection.prototype.addStream = function (e) {
									var t = this;
									t._senders = t._senders || [], o.apply(t, [e]), e.getTracks().forEach(function (e) {
										t._senders.push(n(t, e))
									})
								};
								var t = e.RTCPeerConnection.prototype.removeStream;
								e.RTCPeerConnection.prototype.removeStream = function (e) {
									var i = this;
									i._senders = i._senders || [], t.apply(i, [e]), e.getTracks().forEach(function (t) {
										var e = i._senders.find(function (e) {
											return e.track === t
										});
										e && i._senders.splice(i._senders.indexOf(e), 1)
									})
								}
							}
							else if ("object" == typeof e && e.RTCPeerConnection && "getSenders" in e.RTCPeerConnection.prototype && "createDTMFSender" in e.RTCPeerConnection.prototype && e.RTCRtpSender && !("dtmf" in e.RTCRtpSender.prototype)) {
								var s = e.RTCPeerConnection.prototype.getSenders;
								e.RTCPeerConnection.prototype.getSenders = function () {
									var t = this,
										e = s.apply(t, []);
									return e.forEach(function (e) {
										e._pc = t
									}), e
								}, Object.defineProperty(e.RTCRtpSender.prototype, "dtmf",
									{
										get: function () {
											return void 0 === this._dtmf && ("audio" === this.track.kind ? this._dtmf = this._pc.createDTMFSender(this.track) : this._dtmf = null), this._dtmf
										}
									})
							}
						},
						shimSenderReceiverGetStats: function (e) {
							if ("object" == typeof e && e.RTCPeerConnection && e.RTCRtpSender && e.RTCRtpReceiver) {
								if (!("getStats" in e.RTCRtpSender.prototype)) {
									var i = e.RTCPeerConnection.prototype.getSenders;
									i && (e.RTCPeerConnection.prototype.getSenders = function () {
										var t = this,
											e = i.apply(t, []);
										return e.forEach(function (e) {
											e._pc = t
										}), e
									});
									var t = e.RTCPeerConnection.prototype.addTrack;
									t && (e.RTCPeerConnection.prototype.addTrack = function () {
										var e = t.apply(this, arguments);
										return e._pc = this, e
									}), e.RTCRtpSender.prototype.getStats = function () {
										var t = this;
										return this._pc.getStats().then(function (e) {
											return r(e, t.track, !0)
										})
									}
								}
								if (!("getStats" in e.RTCRtpReceiver.prototype)) {
									var n = e.RTCPeerConnection.prototype.getReceivers;
									n && (e.RTCPeerConnection.prototype.getReceivers = function () {
										var t = this,
											e = n.apply(t, []);
										return e.forEach(function (e) {
											e._pc = t
										}), e
									}), c.wrapPeerConnectionEvent(e, "track", function (e) {
										return e.receiver._pc = e.srcElement, e
									}), e.RTCRtpReceiver.prototype.getStats = function () {
										var t = this;
										return this._pc.getStats().then(function (e) {
											return r(e, t.track, !1)
										})
									}
								}
								if ("getStats" in e.RTCRtpSender.prototype && "getStats" in e.RTCRtpReceiver.prototype) {
									var o = e.RTCPeerConnection.prototype.getStats;
									e.RTCPeerConnection.prototype.getStats = function () {
										if (0 < arguments.length && arguments[0] instanceof e.MediaStreamTrack) {
											var t, i, n, r = arguments[0];
											return this.getSenders().forEach(function (e) {
												e.track === r && (t ? n = !0 : t = e)
											}), this.getReceivers().forEach(function (e) {
												return e.track === r && (i ? n = !0 : i = e), e.track === r
											}), n || t && i ? Promise.reject(new DOMException("There are more than one sender or receiver for the track.", "InvalidAccessError")) : t ? t.getStats() : i ? i.getStats() : Promise.reject(new DOMException("There is no sender or receiver for the track.", "InvalidAccessError"))
										}
										return o.apply(this, arguments)
									}
								}
							}
						},
						shimSourceObject: function (e) {
							var i = e && e.URL;
							"object" == typeof e && (!e.HTMLMediaElement || "srcObject" in e.HTMLMediaElement.prototype || Object.defineProperty(e.HTMLMediaElement.prototype, "srcObject",
								{
									get: function () {
										return this._srcObject
									},
									set: function (e) {
										var t = this;
										this._srcObject = e, this.src && i.revokeObjectURL(this.src), e ? (this.src = i.createObjectURL(e), e.addEventListener("addtrack", function () {
											t.src && i.revokeObjectURL(t.src), t.src = i.createObjectURL(e)
										}), e.addEventListener("removetrack", function () {
											t.src && i.revokeObjectURL(t.src), t.src = i.createObjectURL(e)
										})) : this.src = ""
									}
								}))
						},
						shimAddTrackRemoveTrackWithNative: function (e) {
							e.RTCPeerConnection.prototype.getLocalStreams = function () {
								var t = this;
								return this._shimmedLocalStreams = this._shimmedLocalStreams ||
									{}, Object.keys(this._shimmedLocalStreams).map(function (e) {
										return t._shimmedLocalStreams[e][0]
									})
							};
							var n = e.RTCPeerConnection.prototype.addTrack;
							e.RTCPeerConnection.prototype.addTrack = function (e, t) {
								if (!t) return n.apply(this, arguments);
								this._shimmedLocalStreams = this._shimmedLocalStreams ||
									{};
								var i = n.apply(this, arguments);
								return this._shimmedLocalStreams[t.id] ? -1 === this._shimmedLocalStreams[t.id].indexOf(i) && this._shimmedLocalStreams[t.id].push(i) : this._shimmedLocalStreams[t.id] = [t, i], i
							};
							var r = e.RTCPeerConnection.prototype.addStream;
							e.RTCPeerConnection.prototype.addStream = function (e) {
								var i = this;
								this._shimmedLocalStreams = this._shimmedLocalStreams ||
									{}, e.getTracks().forEach(function (t) {
										if (i.getSenders().find(function (e) {
											return e.track === t
										})) throw new DOMException("Track already exists.", "InvalidAccessError")
									});
								var t = i.getSenders();
								r.apply(this, arguments);
								var n = i.getSenders().filter(function (e) {
									return -1 === t.indexOf(e)
								});
								this._shimmedLocalStreams[e.id] = [e].concat(n)
							};
							var t = e.RTCPeerConnection.prototype.removeStream;
							e.RTCPeerConnection.prototype.removeStream = function (e) {
								return this._shimmedLocalStreams = this._shimmedLocalStreams ||
									{}, delete this._shimmedLocalStreams[e.id], t.apply(this, arguments)
							};
							var o = e.RTCPeerConnection.prototype.removeTrack;
							e.RTCPeerConnection.prototype.removeTrack = function (i) {
								var n = this;
								return this._shimmedLocalStreams = this._shimmedLocalStreams ||
									{}, i && Object.keys(this._shimmedLocalStreams).forEach(function (e) {
										var t = n._shimmedLocalStreams[e].indexOf(i); - 1 !== t && n._shimmedLocalStreams[e].splice(t, 1), 1 === n._shimmedLocalStreams[e].length && delete n._shimmedLocalStreams[e]
									}), o.apply(this, arguments)
							}
						},
						shimAddTrackRemoveTrack: function (s) {
							if (s.RTCPeerConnection) {
								var e = c.detectBrowser(s);
								if (s.RTCPeerConnection.prototype.addTrack && 65 <= e.version) return this.shimAddTrackRemoveTrackWithNative(s);
								var i = s.RTCPeerConnection.prototype.getLocalStreams;
								s.RTCPeerConnection.prototype.getLocalStreams = function () {
									var t = this,
										e = i.apply(this);
									return t._reverseStreams = t._reverseStreams ||
										{}, e.map(function (e) {
											return t._reverseStreams[e.id]
										})
								};
								var n = s.RTCPeerConnection.prototype.addStream;
								s.RTCPeerConnection.prototype.addStream = function (e) {
									var i = this;
									if (i._streams = i._streams ||
										{}, i._reverseStreams = i._reverseStreams ||
										{}, e.getTracks().forEach(function (t) {
											if (i.getSenders().find(function (e) {
												return e.track === t
											})) throw new DOMException("Track already exists.", "InvalidAccessError")
										}), !i._reverseStreams[e.id]) {
										var t = new s.MediaStream(e.getTracks());
										i._streams[e.id] = t, i._reverseStreams[t.id] = e, e = t
									}
									n.apply(i, [e])
								};
								var r = s.RTCPeerConnection.prototype.removeStream;
								s.RTCPeerConnection.prototype.removeStream = function (e) {
									var t = this;
									t._streams = t._streams ||
										{}, t._reverseStreams = t._reverseStreams ||
										{}, r.apply(t, [t._streams[e.id] || e]), delete t._reverseStreams[t._streams[e.id] ? t._streams[e.id].id : e.id], delete t._streams[e.id]
								}, s.RTCPeerConnection.prototype.addTrack = function (t, e) {
									var i = this;
									if ("closed" === i.signalingState) throw new DOMException("The RTCPeerConnection's signalingState is 'closed'.", "InvalidStateError");
									var n = [].slice.call(arguments, 1);
									if (1 !== n.length || !n[0].getTracks().find(function (e) {
										return e === t
									})) throw new DOMException("The adapter.js addTrack polyfill only supports a single  stream which is associated with the specified track.", "NotSupportedError");
									if (i.getSenders().find(function (e) {
										return e.track === t
									})) throw new DOMException("Track already exists.", "InvalidAccessError");
									i._streams = i._streams ||
										{}, i._reverseStreams = i._reverseStreams ||
										{};
									var r = i._streams[e.id];
									if (r) r.addTrack(t), Promise.resolve().then(function () {
										i.dispatchEvent(new Event("negotiationneeded"))
									});
									else {
										var o = new s.MediaStream([t]);
										i._streams[e.id] = o, i._reverseStreams[o.id] = e, i.addStream(o)
									}
									return i.getSenders().find(function (e) {
										return e.track === t
									})
								}, ["createOffer", "createAnswer"].forEach(function (e) {
									var t = s.RTCPeerConnection.prototype[e];
									s.RTCPeerConnection.prototype[e] = function () {
										var i = this,
											n = arguments;
										return arguments.length && "function" == typeof arguments[0] ? t.apply(i, [function (e) {
											var t = a(i, e);
											n[0].apply(null, [t])
										}, function (e) {
											n[1] && n[1].apply(null, e)
										}, arguments[2]]) : t.apply(i, arguments).then(function (e) {
											return a(i, e)
										})
									}
								});
								var t = s.RTCPeerConnection.prototype.setLocalDescription;
								s.RTCPeerConnection.prototype.setLocalDescription = function () {
									return arguments.length && arguments[0].type && (arguments[0] = function (n, e) {
										var r = e.sdp;
										return Object.keys(n._reverseStreams || []).forEach(function (e) {
											var t = n._reverseStreams[e],
												i = n._streams[t.id];
											r = r.replace(new RegExp(t.id, "g"), i.id)
										}), new RTCSessionDescription(
											{
												type: e.type,
												sdp: r
											})
									}(this, arguments[0])), t.apply(this, arguments)
								};
								var o = Object.getOwnPropertyDescriptor(s.RTCPeerConnection.prototype, "localDescription");
								Object.defineProperty(s.RTCPeerConnection.prototype, "localDescription",
									{
										get: function () {
											var e = o.get.apply(this);
											return "" === e.type ? e : a(this, e)
										}
									}), s.RTCPeerConnection.prototype.removeTrack = function (t) {
										var i, n = this;
										if ("closed" === n.signalingState) throw new DOMException("The RTCPeerConnection's signalingState is 'closed'.", "InvalidStateError");
										if (!t._pc) throw new DOMException("Argument 1 of RTCPeerConnection.removeTrack does not implement interface RTCRtpSender.", "TypeError");
										if (!(t._pc === n)) throw new DOMException("Sender was not created by this connection.", "InvalidAccessError");
										n._streams = n._streams ||
											{}, Object.keys(n._streams).forEach(function (e) {
												n._streams[e].getTracks().find(function (e) {
													return t.track === e
												}) && (i = n._streams[e])
											}), i && (1 === i.getTracks().length ? n.removeStream(n._reverseStreams[i.id]) : i.removeTrack(t.track), n.dispatchEvent(new Event("negotiationneeded")))
									}
							}

							function a(n, e) {
								var r = e.sdp;
								return Object.keys(n._reverseStreams || []).forEach(function (e) {
									var t = n._reverseStreams[e],
										i = n._streams[t.id];
									r = r.replace(new RegExp(i.id, "g"), t.id)
								}), new RTCSessionDescription(
									{
										type: e.type,
										sdp: r
									})
							}
						},
						shimPeerConnection: function (i) {
							var e = c.detectBrowser(i);
							if (!i.RTCPeerConnection && i.webkitRTCPeerConnection && (i.RTCPeerConnection = function (e, t) {
								return n("PeerConnection"), e && e.iceTransportPolicy && (e.iceTransports = e.iceTransportPolicy), new i.webkitRTCPeerConnection(e, t)
							}, i.RTCPeerConnection.prototype = i.webkitRTCPeerConnection.prototype, i.webkitRTCPeerConnection.generateCertificate && Object.defineProperty(i.RTCPeerConnection, "generateCertificate",
								{
									get: function () {
										return i.webkitRTCPeerConnection.generateCertificate
									}
								})), i.RTCPeerConnection) {
								var a = i.RTCPeerConnection.prototype.getStats;
								i.RTCPeerConnection.prototype.getStats = function (e, t, i) {
									var n = this,
										r = arguments;
									if (0 < arguments.length && "function" == typeof e) return a.apply(this, arguments);
									if (0 === a.length && (0 === arguments.length || "function" != typeof e)) return a.apply(this, []);

									function o(e) {
										var n = {};
										return e.result().forEach(function (t) {
											var i = {
												id: t.id,
												timestamp: t.timestamp,
												type:
													{
														localcandidate: "local-candidate",
														remotecandidate: "remote-candidate"
													}[t.type] || t.type
											};
											t.names().forEach(function (e) {
												i[e] = t.stat(e)
											}), n[i.id] = i
										}), n
									}

									function s(t) {
										return new Map(Object.keys(t).map(function (e) {
											return [e, t[e]]
										}))
									}
									if (2 <= arguments.length) {
										return a.apply(this, [function (e) {
											r[1](s(o(e)))
										}, e])
									}
									return new Promise(function (t, e) {
										a.apply(n, [function (e) {
											t(s(o(e)))
										}, e])
									}).then(t, i)
								}, e.version < 51 && ["setLocalDescription", "setRemoteDescription", "addIceCandidate"].forEach(function (e) {
									var r = i.RTCPeerConnection.prototype[e];
									i.RTCPeerConnection.prototype[e] = function () {
										var i = arguments,
											n = this,
											e = new Promise(function (e, t) {
												r.apply(n, [i[0], e, t])
											});
										return i.length < 2 ? e : e.then(function () {
											i[1].apply(null, [])
										}, function (e) {
											3 <= i.length && i[2].apply(null, [e])
										})
									}
								}), e.version < 52 && ["createOffer", "createAnswer"].forEach(function (e) {
									var r = i.RTCPeerConnection.prototype[e];
									i.RTCPeerConnection.prototype[e] = function () {
										var i = this;
										if (arguments.length < 1 || 1 === arguments.length && "object" == typeof arguments[0]) {
											var n = 1 === arguments.length ? arguments[0] : void 0;
											return new Promise(function (e, t) {
												r.apply(i, [e, t, n])
											})
										}
										return r.apply(this, arguments)
									}
								}), ["setLocalDescription", "setRemoteDescription", "addIceCandidate"].forEach(function (e) {
									var t = i.RTCPeerConnection.prototype[e];
									i.RTCPeerConnection.prototype[e] = function () {
										return arguments[0] = new ("addIceCandidate" === e ? i.RTCIceCandidate : i.RTCSessionDescription)(arguments[0]), t.apply(this, arguments)
									}
								});
								var t = i.RTCPeerConnection.prototype.addIceCandidate;
								i.RTCPeerConnection.prototype.addIceCandidate = function () {
									return arguments[0] ? t.apply(this, arguments) : (arguments[1] && arguments[1].apply(null), Promise.resolve())
								}
							}
						},
						fixNegotiationNeeded: function (e) {
							c.wrapPeerConnectionEvent(e, "negotiationneeded", function (e) {
								if ("stable" === e.target.signalingState) return e
							})
						},
						shimGetDisplayMedia: function (o, e) {
							!o.navigator || !o.navigator.mediaDevices || "getDisplayMedia" in o.navigator.mediaDevices || ("function" == typeof e ? (o.navigator.mediaDevices.getDisplayMedia = function (r) {
								return e(r).then(function (e) {
									var t = r.video && r.video.width,
										i = r.video && r.video.height,
										n = r.video && r.video.frameRate;
									return r.video = {
										mandatory:
										{
											chromeMediaSource: "desktop",
											chromeMediaSourceId: e,
											maxFrameRate: n || 3
										}
									}, t && (r.video.mandatory.maxWidth = t), i && (r.video.mandatory.maxHeight = i), o.navigator.mediaDevices.getUserMedia(r)
								})
							}, o.navigator.getDisplayMedia = function (e) {
								return c.deprecated("navigator.getDisplayMedia", "navigator.mediaDevices.getDisplayMedia"), o.navigator.mediaDevices.getDisplayMedia(e)
							}) : console.error("shimGetDisplayMedia: getSourceId argument is not a function"))
						}
					}
				},
				{
					"../utils.js": 14,
					"./getusermedia": 6
				}],
				6: [function (e, t, i) {
					"use strict";
					var o = e("../utils.js"),
						l = o.log;
					t.exports = function (e) {
						function s(r) {
							if ("object" != typeof r || r.mandatory || r.optional) return r;
							var o = {};
							return Object.keys(r).forEach(function (t) {
								if ("require" !== t && "advanced" !== t && "mediaSource" !== t) {
									var i = "object" == typeof r[t] ? r[t] :
										{
											ideal: r[t]
										};
									void 0 !== i.exact && "number" == typeof i.exact && (i.min = i.max = i.exact);
									var n = function (e, t) {
										return e ? e + t.charAt(0).toUpperCase() + t.slice(1) : "deviceId" === t ? "sourceId" : t
									};
									if (void 0 !== i.ideal) {
										o.optional = o.optional || [];
										var e = {};
										"number" == typeof i.ideal ? (e[n("min", t)] = i.ideal, o.optional.push(e), (e = {})[n("max", t)] = i.ideal) : e[n("", t)] = i.ideal, o.optional.push(e)
									}
									void 0 !== i.exact && "number" != typeof i.exact ? (o.mandatory = o.mandatory ||
										{}, o.mandatory[n("", t)] = i.exact) : ["min", "max"].forEach(function (e) {
											void 0 !== i[e] && (o.mandatory = o.mandatory ||
												{}, o.mandatory[n(e, t)] = i[e])
										})
								}
							}), r.advanced && (o.optional = (o.optional || []).concat(r.advanced)), o
						}

						function n(i, n) {
							if (61 <= a.version) return n(i);
							if ((i = JSON.parse(JSON.stringify(i))) && "object" == typeof i.audio) {
								var e = function (e, t, i) {
									t in e && !(i in e) && (e[i] = e[t], delete e[t])
								};
								e((i = JSON.parse(JSON.stringify(i))).audio, "autoGainControl", "googAutoGainControl"), e(i.audio, "noiseSuppression", "googNoiseSuppression"), i.audio = s(i.audio)
							}
							if (i && "object" == typeof i.video) {
								var r = i.video.facingMode;
								r = r && ("object" == typeof r ? r :
									{
										ideal: r
									});
								var o, t = a.version < 66;
								if (r && ("user" === r.exact || "environment" === r.exact || "user" === r.ideal || "environment" === r.ideal) && (!c.mediaDevices.getSupportedConstraints || !c.mediaDevices.getSupportedConstraints().facingMode || t))
									if (delete i.video.facingMode, "environment" === r.exact || "environment" === r.ideal ? o = ["back", "rear"] : "user" !== r.exact && "user" !== r.ideal || (o = ["front"]), o) return c.mediaDevices.enumerateDevices().then(function (e) {
										var t = (e = e.filter(function (e) {
											return "videoinput" === e.kind
										})).find(function (t) {
											return o.some(function (e) {
												return -1 !== t.label.toLowerCase().indexOf(e)
											})
										});
										return !t && e.length && -1 !== o.indexOf("back") && (t = e[e.length - 1]), t && (i.video.deviceId = r.exact ?
											{
												exact: t.deviceId
											} :
											{
												ideal: t.deviceId
											}), i.video = s(i.video), l("chrome: " + JSON.stringify(i)), n(i)
									});
								i.video = s(i.video)
							}
							return l("chrome: " + JSON.stringify(i)), n(i)
						}

						function r(e) {
							return 64 <= a.version ? e :
								{
									name:
										{
											PermissionDeniedError: "NotAllowedError",
											PermissionDismissedError: "NotAllowedError",
											InvalidStateError: "NotAllowedError",
											DevicesNotFoundError: "NotFoundError",
											ConstraintNotSatisfiedError: "OverconstrainedError",
											TrackStartError: "NotReadableError",
											MediaDeviceFailedDueToShutdown: "NotAllowedError",
											MediaDeviceKillSwitchOn: "NotAllowedError",
											TabCaptureError: "AbortError",
											ScreenCaptureError: "AbortError",
											DeviceCaptureError: "AbortError"
										}[e.name] || e.name,
									message: e.message,
									constraint: e.constraint || e.constraintName,
									toString: function () {
										return this.name + (this.message && ": ") + this.message
									}
								}
						}
						var a = o.detectBrowser(e),
							c = e && e.navigator;
						c.getUserMedia = function (e, t, i) {
							n(e, function (e) {
								c.webkitGetUserMedia(e, t, function (e) {
									i && i(r(e))
								})
							})
						};

						function t(i) {
							return new Promise(function (e, t) {
								c.getUserMedia(i, e, t)
							})
						}
						if (c.mediaDevices || (c.mediaDevices = {
							getUserMedia: t,
							enumerateDevices: function () {
								return new Promise(function (t) {
									var i = {
										audio: "audioinput",
										video: "videoinput"
									};
									return e.MediaStreamTrack.getSources(function (e) {
										t(e.map(function (e) {
											return {
												label: e.label,
												kind: i[e.kind],
												deviceId: e.id,
												groupId: ""
											}
										}))
									})
								})
							},
							getSupportedConstraints: function () {
								return {
									deviceId: !0,
									echoCancellation: !0,
									facingMode: !0,
									frameRate: !0,
									height: !0,
									width: !0
								}
							}
						}), c.mediaDevices.getUserMedia) {
							var i = c.mediaDevices.getUserMedia.bind(c.mediaDevices);
							c.mediaDevices.getUserMedia = function (e) {
								return n(e, function (t) {
									return i(t).then(function (e) {
										if (t.audio && !e.getAudioTracks().length || t.video && !e.getVideoTracks().length) throw e.getTracks().forEach(function (e) {
											e.stop()
										}), new DOMException("", "NotFoundError");
										return e
									}, function (e) {
										return Promise.reject(r(e))
									})
								})
							}
						}
						else c.mediaDevices.getUserMedia = function (e) {
							return t(e)
						};
						void 0 === c.mediaDevices.addEventListener && (c.mediaDevices.addEventListener = function () {
							l("Dummy mediaDevices.addEventListener called.")
						}), void 0 === c.mediaDevices.removeEventListener && (c.mediaDevices.removeEventListener = function () {
							l("Dummy mediaDevices.removeEventListener called.")
						})
					}
				},
				{
					"../utils.js": 14
				}],
				7: [function (e, t, i) {
					"use strict";
					var a = e("sdp"),
						c = e("./utils");
					t.exports = {
						shimRTCIceCandidate: function (t) {
							if (t.RTCIceCandidate && !(t.RTCIceCandidate && "foundation" in t.RTCIceCandidate.prototype)) {
								var r = t.RTCIceCandidate;
								t.RTCIceCandidate = function (e) {
									if ("object" == typeof e && e.candidate && 0 === e.candidate.indexOf("a=") && ((e = JSON.parse(JSON.stringify(e))).candidate = e.candidate.substr(2)), e.candidate && e.candidate.length) {
										var t = new r(e),
											i = a.parseCandidate(e.candidate),
											n = Object.assign(t, i);
										return n.toJSON = function () {
											return {
												candidate: n.candidate,
												sdpMid: n.sdpMid,
												sdpMLineIndex: n.sdpMLineIndex,
												usernameFragment: n.usernameFragment
											}
										}, n
									}
									return new r(e)
								}, t.RTCIceCandidate.prototype = r.prototype, c.wrapPeerConnectionEvent(t, "icecandidate", function (e) {
									return e.candidate && Object.defineProperty(e, "candidate",
										{
											value: new t.RTCIceCandidate(e.candidate),
											writable: "false"
										}), e
								})
							}
						},
						shimCreateObjectURL: function (e) {
							var t = e && e.URL;
							if ("object" == typeof e && e.HTMLMediaElement && "srcObject" in e.HTMLMediaElement.prototype && t.createObjectURL && t.revokeObjectURL) {
								var i = t.createObjectURL.bind(t),
									n = t.revokeObjectURL.bind(t),
									r = new Map,
									o = 0;
								t.createObjectURL = function (e) {
									if ("getTracks" in e) {
										var t = "polyblob:" + ++o;
										return r.set(t, e), c.deprecated("URL.createObjectURL(stream)", "elem.srcObject = stream"), t
									}
									return i(e)
								}, t.revokeObjectURL = function (e) {
									n(e), r.delete(e)
								};
								var s = Object.getOwnPropertyDescriptor(e.HTMLMediaElement.prototype, "src");
								Object.defineProperty(e.HTMLMediaElement.prototype, "src",
									{
										get: function () {
											return s.get.apply(this)
										},
										set: function (e) {
											return this.srcObject = r.get(e) || null, s.set.apply(this, [e])
										}
									});
								var a = e.HTMLMediaElement.prototype.setAttribute;
								e.HTMLMediaElement.prototype.setAttribute = function () {
									return 2 === arguments.length && "src" === ("" + arguments[0]).toLowerCase() && (this.srcObject = r.get(arguments[1]) || null), a.apply(this, arguments)
								}
							}
						},
						shimMaxMessageSize: function (e) {
							if (!e.RTCSctpTransport && e.RTCPeerConnection) {
								var o = c.detectBrowser(e);
								"sctp" in e.RTCPeerConnection.prototype || Object.defineProperty(e.RTCPeerConnection.prototype, "sctp",
									{
										get: function () {
											return void 0 === this._sctp ? null : this._sctp
										}
									});
								var s = e.RTCPeerConnection.prototype.setRemoteDescription;
								e.RTCPeerConnection.prototype.setRemoteDescription = function () {
									if (this._sctp = null, function (e) {
										var t = a.splitSections(e.sdp);
										return t.shift(), t.some(function (e) {
											var t = a.parseMLine(e);
											return t && "application" === t.kind && -1 !== t.protocol.indexOf("SCTP")
										})
									}(arguments[0])) {
										var e, t = function (e) {
											var t = e.sdp.match(/mozilla...THIS_IS_SDPARTA-(\d+)/);
											if (null === t || t.length < 2) return -1;
											var i = parseInt(t[1], 10);
											return i != i ? -1 : i
										}(arguments[0]),
											i = function (e) {
												var t = 65536;
												return "firefox" === o.browser && (t = o.version < 57 ? -1 === e ? 16384 : 2147483637 : o.version < 60 ? 57 === o.version ? 65535 : 65536 : 2147483637), t
											}(t),
											n = function (e, t) {
												var i = 65536;
												"firefox" === o.browser && 57 === o.version && (i = 65535);
												var n = a.matchPrefix(e.sdp, "a=max-message-size:");
												return 0 < n.length ? i = parseInt(n[0].substr(19), 10) : "firefox" === o.browser && -1 !== t && (i = 2147483637), i
											}(arguments[0], t);
										e = 0 === i && 0 === n ? Number.POSITIVE_INFINITY : 0 === i || 0 === n ? Math.max(i, n) : Math.min(i, n);
										var r = {};
										Object.defineProperty(r, "maxMessageSize",
											{
												get: function () {
													return e
												}
											}), this._sctp = r
									}
									return s.apply(this, arguments)
								}
							}
						},
						shimSendThrowTypeError: function (e) {
							if (e.RTCPeerConnection && "createDataChannel" in e.RTCPeerConnection.prototype) {
								var t = e.RTCPeerConnection.prototype.createDataChannel;
								e.RTCPeerConnection.prototype.createDataChannel = function () {
									var e = t.apply(this, arguments);
									return i(e, this), e
								}, c.wrapPeerConnectionEvent(e, "datachannel", function (e) {
									return i(e.channel, e.target), e
								})
							}

							function i(i, n) {
								var r = i.send;
								i.send = function () {
									var e = arguments[0],
										t = e.length || e.size || e.byteLength;
									if ("open" === i.readyState && n.sctp && t > n.sctp.maxMessageSize) throw new TypeError("Message too large (can send a maximum of " + n.sctp.maxMessageSize + " bytes)");
									return r.apply(i, arguments)
								}
							}
						}
					}
				},
				{
					"./utils": 14,
					sdp: 2
				}],
				8: [function (e, t, i) {
					"use strict";
					var r = e("../utils"),
						o = e("./filtericeservers"),
						s = e("rtcpeerconnection-shim");
					t.exports = {
						shimGetUserMedia: e("./getusermedia"),
						shimPeerConnection: function (e) {
							var t = r.detectBrowser(e);
							if (e.RTCIceGatherer && (e.RTCIceCandidate || (e.RTCIceCandidate = function (e) {
								return e
							}), e.RTCSessionDescription || (e.RTCSessionDescription = function (e) {
								return e
							}), t.version < 15025)) {
								var i = Object.getOwnPropertyDescriptor(e.MediaStreamTrack.prototype, "enabled");
								Object.defineProperty(e.MediaStreamTrack.prototype, "enabled",
									{
										set: function (e) {
											i.set.call(this, e);
											var t = new Event("enabled");
											t.enabled = e, this.dispatchEvent(t)
										}
									})
							} !e.RTCRtpSender || "dtmf" in e.RTCRtpSender.prototype || Object.defineProperty(e.RTCRtpSender.prototype, "dtmf",
								{
									get: function () {
										return void 0 === this._dtmf && ("audio" === this.track.kind ? this._dtmf = new e.RTCDtmfSender(this) : "video" === this.track.kind && (this._dtmf = null)), this._dtmf
									}
								}), e.RTCDtmfSender && !e.RTCDTMFSender && (e.RTCDTMFSender = e.RTCDtmfSender);
							var n = s(e, t.version);
							e.RTCPeerConnection = function (e) {
								return e && e.iceServers && (e.iceServers = o(e.iceServers)), new n(e)
							}, e.RTCPeerConnection.prototype = n.prototype
						},
						shimReplaceTrack: function (e) {
							!e.RTCRtpSender || "replaceTrack" in e.RTCRtpSender.prototype || (e.RTCRtpSender.prototype.replaceTrack = e.RTCRtpSender.prototype.setTrack)
						},
						shimGetDisplayMedia: function (t, e) {
							if ("getDisplayMedia" in t.navigator && t.navigator.mediaDevices && !("getDisplayMedia" in t.navigator.mediaDevices)) {
								var i = t.navigator.getDisplayMedia;
								t.navigator.mediaDevices.getDisplayMedia = function (e) {
									return i.call(t.navigator, e)
								}, t.navigator.getDisplayMedia = function (e) {
									return r.deprecated("navigator.getDisplayMedia", "navigator.mediaDevices.getDisplayMedia"), i.call(t.navigator, e)
								}
							}
						}
					}
				},
				{
					"../utils": 14,
					"./filtericeservers": 9,
					"./getusermedia": 10,
					"rtcpeerconnection-shim": 1
				}],
				9: [function (e, t, i) {
					"use strict";
					var o = e("../utils");
					t.exports = function (e, n) {
						var r = !1;
						return (e = JSON.parse(JSON.stringify(e))).filter(function (e) {
							if (e && (e.urls || e.url)) {
								var t = e.urls || e.url;
								e.url && !e.urls && o.deprecated("RTCIceServer.url", "RTCIceServer.urls");
								var i = "string" == typeof t;
								return i && (t = [t]), t = t.filter(function (e) {
									return 0 === e.indexOf("turn:") && -1 !== e.indexOf("transport=udp") && -1 === e.indexOf("turn:[") && !r ? r = !0 : 0 === e.indexOf("stun:") && 14393 <= n && -1 === e.indexOf("?transport=udp")
								}), delete e.url, e.urls = i ? t[0] : t, !!t.length
							}
						})
					}
				},
				{
					"../utils": 14
				}],
				10: [function (e, t, i) {
					"use strict";
					t.exports = function (e) {
						var t = e && e.navigator,
							i = t.mediaDevices.getUserMedia.bind(t.mediaDevices);
						t.mediaDevices.getUserMedia = function (e) {
							return i(e).catch(function (e) {
								return Promise.reject(function (e) {
									return {
										name:
											{
												PermissionDeniedError: "NotAllowedError"
											}[e.name] || e.name,
										message: e.message,
										constraint: e.constraint,
										toString: function () {
											return this.name
										}
									}
								}(e))
							})
						}
					}
				},
				{}],
				11: [function (e, t, i) {
					"use strict";
					var o = e("../utils");
					t.exports = {
						shimGetUserMedia: e("./getusermedia"),
						shimOnTrack: function (e) {
							"object" != typeof e || !e.RTCPeerConnection || "ontrack" in e.RTCPeerConnection.prototype || Object.defineProperty(e.RTCPeerConnection.prototype, "ontrack",
								{
									get: function () {
										return this._ontrack
									},
									set: function (e) {
										this._ontrack && (this.removeEventListener("track", this._ontrack), this.removeEventListener("addstream", this._ontrackpoly)), this.addEventListener("track", this._ontrack = e), this.addEventListener("addstream", this._ontrackpoly = function (i) {
											i.stream.getTracks().forEach(function (e) {
												var t = new Event("track");
												t.track = e, t.receiver = {
													track: e
												}, t.transceiver = {
													receiver: t.receiver
												}, t.streams = [i.stream], this.dispatchEvent(t)
											}.bind(this))
										}.bind(this))
									},
									enumerable: !0,
									configurable: !0
								}), "object" == typeof e && e.RTCTrackEvent && "receiver" in e.RTCTrackEvent.prototype && !("transceiver" in e.RTCTrackEvent.prototype) && Object.defineProperty(e.RTCTrackEvent.prototype, "transceiver",
									{
										get: function () {
											return {
												receiver: this.receiver
											}
										}
									})
						},
						shimSourceObject: function (e) {
							"object" == typeof e && (!e.HTMLMediaElement || "srcObject" in e.HTMLMediaElement.prototype || Object.defineProperty(e.HTMLMediaElement.prototype, "srcObject",
								{
									get: function () {
										return this.mozSrcObject
									},
									set: function (e) {
										this.mozSrcObject = e
									}
								}))
						},
						shimPeerConnection: function (a) {
							var c = o.detectBrowser(a);
							if ("object" == typeof a && (a.RTCPeerConnection || a.mozRTCPeerConnection)) {
								a.RTCPeerConnection || (a.RTCPeerConnection = function (e, t) {
									if (c.version < 38 && e && e.iceServers) {
										for (var i = [], n = 0; n < e.iceServers.length; n++) {
											var r = e.iceServers[n];
											if (r.hasOwnProperty("urls"))
												for (var o = 0; o < r.urls.length; o++) {
													var s = {
														url: r.urls[o]
													};
													0 === r.urls[o].indexOf("turn") && (s.username = r.username, s.credential = r.credential), i.push(s)
												}
											else i.push(e.iceServers[n])
										}
										e.iceServers = i
									}
									return new a.mozRTCPeerConnection(e, t)
								}, a.RTCPeerConnection.prototype = a.mozRTCPeerConnection.prototype, a.mozRTCPeerConnection.generateCertificate && Object.defineProperty(a.RTCPeerConnection, "generateCertificate",
									{
										get: function () {
											return a.mozRTCPeerConnection.generateCertificate
										}
									}), a.RTCSessionDescription = a.mozRTCSessionDescription, a.RTCIceCandidate = a.mozRTCIceCandidate), ["setLocalDescription", "setRemoteDescription", "addIceCandidate"].forEach(function (e) {
										var t = a.RTCPeerConnection.prototype[e];
										a.RTCPeerConnection.prototype[e] = function () {
											return arguments[0] = new ("addIceCandidate" === e ? a.RTCIceCandidate : a.RTCSessionDescription)(arguments[0]), t.apply(this, arguments)
										}
									});
								var e = a.RTCPeerConnection.prototype.addIceCandidate;
								a.RTCPeerConnection.prototype.addIceCandidate = function () {
									return arguments[0] ? e.apply(this, arguments) : (arguments[1] && arguments[1].apply(null), Promise.resolve())
								};
								var n = {
									inboundrtp: "inbound-rtp",
									outboundrtp: "outbound-rtp",
									candidatepair: "candidate-pair",
									localcandidate: "local-candidate",
									remotecandidate: "remote-candidate"
								},
									r = a.RTCPeerConnection.prototype.getStats;
								a.RTCPeerConnection.prototype.getStats = function (e, t, i) {
									return r.apply(this, [e || null]).then(function (i) {
										if (c.version < 48 && (i = function (t) {
											var i = new Map;
											return Object.keys(t).forEach(function (e) {
												i.set(e, t[e]), i[e] = t[e]
											}), i
										}(i)), c.version < 53 && !t) try {
												i.forEach(function (e) {
													e.type = n[e.type] || e.type
												})
											}
											catch (e) {
												if ("TypeError" !== e.name) throw e;
												i.forEach(function (e, t) {
													i.set(t, Object.assign(
														{}, e,
														{
															type: n[e.type] || e.type
														}))
												})
											}
										return i
									}).then(t, i)
								}
							}
						},
						shimSenderGetStats: function (e) {
							if ("object" == typeof e && e.RTCPeerConnection && e.RTCRtpSender && !(e.RTCRtpSender && "getStats" in e.RTCRtpSender.prototype)) {
								var i = e.RTCPeerConnection.prototype.getSenders;
								i && (e.RTCPeerConnection.prototype.getSenders = function () {
									var t = this,
										e = i.apply(t, []);
									return e.forEach(function (e) {
										e._pc = t
									}), e
								});
								var t = e.RTCPeerConnection.prototype.addTrack;
								t && (e.RTCPeerConnection.prototype.addTrack = function () {
									var e = t.apply(this, arguments);
									return e._pc = this, e
								}), e.RTCRtpSender.prototype.getStats = function () {
									return this.track ? this._pc.getStats(this.track) : Promise.resolve(new Map)
								}
							}
						},
						shimReceiverGetStats: function (e) {
							if ("object" == typeof e && e.RTCPeerConnection && e.RTCRtpSender && !(e.RTCRtpSender && "getStats" in e.RTCRtpReceiver.prototype)) {
								var i = e.RTCPeerConnection.prototype.getReceivers;
								i && (e.RTCPeerConnection.prototype.getReceivers = function () {
									var t = this,
										e = i.apply(t, []);
									return e.forEach(function (e) {
										e._pc = t
									}), e
								}), o.wrapPeerConnectionEvent(e, "track", function (e) {
									return e.receiver._pc = e.srcElement, e
								}), e.RTCRtpReceiver.prototype.getStats = function () {
									return this._pc.getStats(this.track)
								}
							}
						},
						shimRemoveStream: function (e) {
							!e.RTCPeerConnection || "removeStream" in e.RTCPeerConnection.prototype || (e.RTCPeerConnection.prototype.removeStream = function (t) {
								var i = this;
								o.deprecated("removeStream", "removeTrack"), this.getSenders().forEach(function (e) {
									e.track && -1 !== t.getTracks().indexOf(e.track) && i.removeTrack(e)
								})
							})
						},
						shimRTCDataChannel: function (e) {
							e.DataChannel && !e.RTCDataChannel && (e.RTCDataChannel = e.DataChannel)
						},
						shimGetDisplayMedia: function (i, n) {
							!i.navigator || !i.navigator.mediaDevices || "getDisplayMedia" in i.navigator.mediaDevices || (i.navigator.mediaDevices.getDisplayMedia = function (e) {
								if (e && e.video) return !0 === e.video ? e.video = {
									mediaSource: n
								} : e.video.mediaSource = n, i.navigator.mediaDevices.getUserMedia(e);
								var t = new DOMException("getDisplayMedia without video constraints is undefined");
								return t.name = "NotFoundError", t.code = 8, Promise.reject(t)
							}, i.navigator.getDisplayMedia = function (e) {
								return o.deprecated("navigator.getDisplayMedia", "navigator.mediaDevices.getDisplayMedia"), i.navigator.mediaDevices.getDisplayMedia(e)
							})
						}
					}
				},
				{
					"../utils": 14,
					"./getusermedia": 12
				}],
				12: [function (e, t, i) {
					"use strict";
					var u = e("../utils"),
						p = u.log;
					t.exports = function (e) {
						function r(e) {
							return {
								name:
									{
										InternalError: "NotReadableError",
										NotSupportedError: "TypeError",
										PermissionDeniedError: "NotAllowedError",
										SecurityError: "NotAllowedError"
									}[e.name] || e.name,
								message:
									{
										"The operation is insecure.": "The request is not allowed by the user agent or the platform in the current context."
									}[e.message] || e.message,
								constraint: e.constraint,
								toString: function () {
									return this.name + (this.message && ": ") + this.message
								}
							}
						}

						function n(e, t, i) {
							function n(n) {
								if ("object" != typeof n || n.require) return n;
								var r = [];
								return Object.keys(n).forEach(function (e) {
									if ("require" !== e && "advanced" !== e && "mediaSource" !== e) {
										var t = n[e] = "object" == typeof n[e] ? n[e] :
											{
												ideal: n[e]
											};
										if (void 0 === t.min && void 0 === t.max && void 0 === t.exact || r.push(e), void 0 !== t.exact && ("number" == typeof t.exact ? t.min = t.max = t.exact : n[e] = t.exact, delete t.exact), void 0 !== t.ideal) {
											n.advanced = n.advanced || [];
											var i = {};
											"number" == typeof t.ideal ? i[e] = {
												min: t.ideal,
												max: t.ideal
											} : i[e] = t.ideal, n.advanced.push(i), delete t.ideal, Object.keys(t).length || delete n[e]
										}
									}
								}), r.length && (n.require = r), n
							}
							return e = JSON.parse(JSON.stringify(e)), o.version < 38 && (p("spec: " + JSON.stringify(e)), e.audio && (e.audio = n(e.audio)), e.video && (e.video = n(e.video)), p("ff37: " + JSON.stringify(e))), s.mozGetUserMedia(e, t, function (e) {
								i(r(e))
							})
						}
						var o = u.detectBrowser(e),
							s = e && e.navigator,
							t = e && e.MediaStreamTrack;
						if (s.mediaDevices || (s.mediaDevices = {
							getUserMedia: function (i) {
								return new Promise(function (e, t) {
									n(i, e, t)
								})
							},
							addEventListener: function () { },
							removeEventListener: function () { }
						}), s.mediaDevices.enumerateDevices = s.mediaDevices.enumerateDevices || function () {
							return new Promise(function (e) {
								e([
									{
										kind: "audioinput",
										deviceId: "default",
										label: "",
										groupId: ""
									},
									{
										kind: "videoinput",
										deviceId: "default",
										label: "",
										groupId: ""
									}])
							})
						}, o.version < 41) {
							var i = s.mediaDevices.enumerateDevices.bind(s.mediaDevices);
							s.mediaDevices.enumerateDevices = function () {
								return i().then(void 0, function (e) {
									if ("NotFoundError" === e.name) return [];
									throw e
								})
							}
						}
						if (o.version < 49) {
							var a = s.mediaDevices.getUserMedia.bind(s.mediaDevices);
							s.mediaDevices.getUserMedia = function (t) {
								return a(t).then(function (e) {
									if (t.audio && !e.getAudioTracks().length || t.video && !e.getVideoTracks().length) throw e.getTracks().forEach(function (e) {
										e.stop()
									}), new DOMException("The object can not be found here.", "NotFoundError");
									return e
								}, function (e) {
									return Promise.reject(r(e))
								})
							}
						}
						if (!(55 < o.version && "autoGainControl" in s.mediaDevices.getSupportedConstraints())) {
							var c = function (e, t, i) {
								t in e && !(i in e) && (e[i] = e[t], delete e[t])
							},
								l = s.mediaDevices.getUserMedia.bind(s.mediaDevices);
							if (s.mediaDevices.getUserMedia = function (e) {
								return "object" == typeof e && "object" == typeof e.audio && (e = JSON.parse(JSON.stringify(e)), c(e.audio, "autoGainControl", "mozAutoGainControl"), c(e.audio, "noiseSuppression", "mozNoiseSuppression")), l(e)
							}, t && t.prototype.getSettings) {
								var d = t.prototype.getSettings;
								t.prototype.getSettings = function () {
									var e = d.apply(this, arguments);
									return c(e, "mozAutoGainControl", "autoGainControl"), c(e, "mozNoiseSuppression", "noiseSuppression"), e
								}
							}
							if (t && t.prototype.applyConstraints) {
								var h = t.prototype.applyConstraints;
								t.prototype.applyConstraints = function (e) {
									return "audio" === this.kind && "object" == typeof e && (e = JSON.parse(JSON.stringify(e)), c(e, "autoGainControl", "mozAutoGainControl"), c(e, "noiseSuppression", "mozNoiseSuppression")), h.apply(this, [e])
								}
							}
						}
						s.getUserMedia = function (e, t, i) {
							if (o.version < 44) return n(e, t, i);
							u.deprecated("navigator.getUserMedia", "navigator.mediaDevices.getUserMedia"), s.mediaDevices.getUserMedia(e).then(t, i)
						}
					}
				},
				{
					"../utils": 14
				}],
				13: [function (e, t, i) {
					"use strict";
					var s = e("../utils");
					t.exports = {
						shimLocalStreamsAPI: function (e) {
							if ("object" == typeof e && e.RTCPeerConnection) {
								if ("getLocalStreams" in e.RTCPeerConnection.prototype || (e.RTCPeerConnection.prototype.getLocalStreams = function () {
									return this._localStreams || (this._localStreams = []), this._localStreams
								}), "getStreamById" in e.RTCPeerConnection.prototype || (e.RTCPeerConnection.prototype.getStreamById = function (t) {
									var i = null;
									return this._localStreams && this._localStreams.forEach(function (e) {
										e.id === t && (i = e)
									}), this._remoteStreams && this._remoteStreams.forEach(function (e) {
										e.id === t && (i = e)
									}), i
								}), !("addStream" in e.RTCPeerConnection.prototype)) {
									var n = e.RTCPeerConnection.prototype.addTrack;
									e.RTCPeerConnection.prototype.addStream = function (t) {
										this._localStreams || (this._localStreams = []), -1 === this._localStreams.indexOf(t) && this._localStreams.push(t);
										var i = this;
										t.getTracks().forEach(function (e) {
											n.call(i, e, t)
										})
									}, e.RTCPeerConnection.prototype.addTrack = function (e, t) {
										return t && (this._localStreams ? -1 === this._localStreams.indexOf(t) && this._localStreams.push(t) : this._localStreams = [t]), n.call(this, e, t)
									}
								}
								"removeStream" in e.RTCPeerConnection.prototype || (e.RTCPeerConnection.prototype.removeStream = function (e) {
									this._localStreams || (this._localStreams = []);
									var t = this._localStreams.indexOf(e);
									if (-1 !== t) {
										this._localStreams.splice(t, 1);
										var i = this,
											n = e.getTracks();
										this.getSenders().forEach(function (e) {
											-1 !== n.indexOf(e.track) && i.removeTrack(e)
										})
									}
								})
							}
						},
						shimRemoteStreamsAPI: function (e) {
							if ("object" == typeof e && e.RTCPeerConnection && ("getRemoteStreams" in e.RTCPeerConnection.prototype || (e.RTCPeerConnection.prototype.getRemoteStreams = function () {
								return this._remoteStreams ? this._remoteStreams : []
							}), !("onaddstream" in e.RTCPeerConnection.prototype))) {
								Object.defineProperty(e.RTCPeerConnection.prototype, "onaddstream",
									{
										get: function () {
											return this._onaddstream
										},
										set: function (e) {
											this._onaddstream && this.removeEventListener("addstream", this._onaddstream), this.addEventListener("addstream", this._onaddstream = e)
										}
									});
								var t = e.RTCPeerConnection.prototype.setRemoteDescription;
								e.RTCPeerConnection.prototype.setRemoteDescription = function () {
									var i = this;
									return this._onaddstreampoly || this.addEventListener("track", this._onaddstreampoly = function (e) {
										e.streams.forEach(function (e) {
											if (i._remoteStreams || (i._remoteStreams = []), !(0 <= i._remoteStreams.indexOf(e))) {
												i._remoteStreams.push(e);
												var t = new Event("addstream");
												t.stream = e, i.dispatchEvent(t)
											}
										})
									}), t.apply(i, arguments)
								}
							}
						},
						shimCallbacksAPI: function (e) {
							if ("object" == typeof e && e.RTCPeerConnection) {
								var t = e.RTCPeerConnection.prototype,
									r = t.createOffer,
									o = t.createAnswer,
									s = t.setLocalDescription,
									a = t.setRemoteDescription,
									c = t.addIceCandidate;
								t.createOffer = function (e, t) {
									var i = 2 <= arguments.length ? arguments[2] : e,
										n = r.apply(this, [i]);
									return t ? (n.then(e, t), Promise.resolve()) : n
								}, t.createAnswer = function (e, t) {
									var i = 2 <= arguments.length ? arguments[2] : e,
										n = o.apply(this, [i]);
									return t ? (n.then(e, t), Promise.resolve()) : n
								};
								var i = function (e, t, i) {
									var n = s.apply(this, [e]);
									return i ? (n.then(t, i), Promise.resolve()) : n
								};
								t.setLocalDescription = i, i = function (e, t, i) {
									var n = a.apply(this, [e]);
									return i ? (n.then(t, i), Promise.resolve()) : n
								}, t.setRemoteDescription = i, i = function (e, t, i) {
									var n = c.apply(this, [e]);
									return i ? (n.then(t, i), Promise.resolve()) : n
								}, t.addIceCandidate = i
							}
						},
						shimGetUserMedia: function (e) {
							var n = e && e.navigator;
							n.getUserMedia || (n.webkitGetUserMedia ? n.getUserMedia = n.webkitGetUserMedia.bind(n) : n.mediaDevices && n.mediaDevices.getUserMedia && (n.getUserMedia = function (e, t, i) {
								n.mediaDevices.getUserMedia(e).then(t, i)
							}.bind(n)))
						},
						shimRTCIceServerUrls: function (e) {
							var o = e.RTCPeerConnection;
							e.RTCPeerConnection = function (e, t) {
								if (e && e.iceServers) {
									for (var i = [], n = 0; n < e.iceServers.length; n++) {
										var r = e.iceServers[n];
										!r.hasOwnProperty("urls") && r.hasOwnProperty("url") ? (s.deprecated("RTCIceServer.url", "RTCIceServer.urls"), (r = JSON.parse(JSON.stringify(r))).urls = r.url, delete r.url, i.push(r)) : i.push(e.iceServers[n])
									}
									e.iceServers = i
								}
								return new o(e, t)
							}, e.RTCPeerConnection.prototype = o.prototype, "generateCertificate" in e.RTCPeerConnection && Object.defineProperty(e.RTCPeerConnection, "generateCertificate",
								{
									get: function () {
										return o.generateCertificate
									}
								})
						},
						shimTrackEventTransceiver: function (e) {
							"object" == typeof e && e.RTCPeerConnection && "receiver" in e.RTCTrackEvent.prototype && !e.RTCTransceiver && Object.defineProperty(e.RTCTrackEvent.prototype, "transceiver",
								{
									get: function () {
										return {
											receiver: this.receiver
										}
									}
								})
						},
						shimCreateOfferLegacy: function (e) {
							var r = e.RTCPeerConnection.prototype.createOffer;
							e.RTCPeerConnection.prototype.createOffer = function (e) {
								var t = this;
								if (e) {
									void 0 !== e.offerToReceiveAudio && (e.offerToReceiveAudio = !!e.offerToReceiveAudio);
									var i = t.getTransceivers().find(function (e) {
										return e.sender.track && "audio" === e.sender.track.kind
									});
									!1 === e.offerToReceiveAudio && i ? "sendrecv" === i.direction ? i.setDirection ? i.setDirection("sendonly") : i.direction = "sendonly" : "recvonly" === i.direction && (i.setDirection ? i.setDirection("inactive") : i.direction = "inactive") : !0 !== e.offerToReceiveAudio || i || t.addTransceiver("audio"), void 0 !== e.offerToReceiveVideo && (e.offerToReceiveVideo = !!e.offerToReceiveVideo);
									var n = t.getTransceivers().find(function (e) {
										return e.sender.track && "video" === e.sender.track.kind
									});
									!1 === e.offerToReceiveVideo && n ? "sendrecv" === n.direction ? n.setDirection("sendonly") : "recvonly" === n.direction && n.setDirection("inactive") : !0 !== e.offerToReceiveVideo || n || t.addTransceiver("video")
								}
								return r.apply(t, arguments)
							}
						}
					}
				},
				{
					"../utils": 14
				}],
				14: [function (e, t, i) {
					"use strict";
					var n = !0,
						r = !0;

					function o(e, t, i) {
						var n = e.match(t);
						return n && n.length >= i && parseInt(n[i], 10)
					}
					t.exports = {
						extractVersion: o,
						wrapPeerConnectionEvent: function (e, n, r) {
							if (e.RTCPeerConnection) {
								var t = e.RTCPeerConnection.prototype,
									o = t.addEventListener;
								t.addEventListener = function (e, i) {
									if (e !== n) return o.apply(this, arguments);

									function t(e) {
										var t = r(e);
										t && i(t)
									}
									return this._eventMap = this._eventMap ||
										{}, this._eventMap[i] = t, o.apply(this, [e, t])
								};
								var s = t.removeEventListener;
								t.removeEventListener = function (e, t) {
									if (e !== n || !this._eventMap || !this._eventMap[t]) return s.apply(this, arguments);
									var i = this._eventMap[t];
									return delete this._eventMap[t], s.apply(this, [e, i])
								}, Object.defineProperty(t, "on" + n,
									{
										get: function () {
											return this["_on" + n]
										},
										set: function (e) {
											this["_on" + n] && (this.removeEventListener(n, this["_on" + n]), delete this["_on" + n]), e && this.addEventListener(n, this["_on" + n] = e)
										},
										enumerable: !0,
										configurable: !0
									})
							}
						},
						disableLog: function (e) {
							return "boolean" != typeof e ? new Error("Argument type: " + typeof e + ". Please use a boolean.") : (n = e) ? "adapter.js logging disabled" : "adapter.js logging enabled"
						},
						disableWarnings: function (e) {
							return "boolean" != typeof e ? new Error("Argument type: " + typeof e + ". Please use a boolean.") : (r = !e, "adapter.js deprecation warnings " + (e ? "disabled" : "enabled"))
						},
						log: function () {
							if ("object" == typeof window) {
								if (n) return;
								"undefined" != typeof console && "function" == typeof console.log && console.log.apply(console, arguments)
							}
						},
						deprecated: function (e, t) {
							r && console.warn(e + " is deprecated, please use " + t + " instead.")
						},
						detectBrowser: function (e) {
							var t = e && e.navigator,
								i = {
									browser: null,
									version: null
								};
							if (void 0 === e || !e.navigator) return i.browser = "Not a browser.", i;
							if (t.mozGetUserMedia) i.browser = "firefox", i.version = o(t.userAgent, /Firefox\/(\d+)\./, 1);
							else if (t.webkitGetUserMedia) i.browser = "chrome", i.version = o(t.userAgent, /Chrom(e|ium)\/(\d+)\./, 2);
							else if (t.mediaDevices && t.userAgent.match(/Edge\/(\d+).(\d+)$/)) i.browser = "edge", i.version = o(t.userAgent, /Edge\/(\d+).(\d+)$/, 2);
							else {
								if (!e.RTCPeerConnection || !t.userAgent.match(/AppleWebKit\/(\d+)\./)) return i.browser = "Not a supported browser.", i;
								i.browser = "safari", i.version = o(t.userAgent, /AppleWebKit\/(\d+)\./, 1)
							}
							return i
						}
					}
				},
				{}]
			},
			{}, [3])(3)
	}),
	function () {
		window.WebComponents = window.WebComponents ||
		{
			flags:
				{}
		};
		var e = document.querySelector('script[src*="webcomponents-lite.js"]'),
			n = {};
		if (!n.noOpts) {
			if (location.search.slice(1).split("&").forEach(function (e) {
				var t, i = e.split("=");
				i[0] && (t = i[0].match(/wc-(.+)/)) && (n[t[1]] = i[1] || !0)
			}), e)
				for (var t, i = 0; t = e.attributes[i]; i++) "src" !== t.name && (n[t.name] = t.value || !0);
			if (n.log && n.log.split) {
				var r = n.log.split(",");
				n.log = {}, r.forEach(function (e) {
					n.log[e] = !0
				})
			}
			else n.log = {}
		}
		n.register && (window.CustomElements = window.CustomElements ||
		{
			flags:
				{}
		}, window.CustomElements.flags.register = n.register), WebComponents.flags = n
	}(),
	function (e) {
		"use strict";
		var t = !1;
		if (!e.forceJURL) try {
				var i = new URL("b", "http://a");
				i.pathname = "c%20d", t = "http://a/c%20d" === i.href
			}
			catch (e) { }
		if (!t) {
			var b = Object.create(null);
			b.ftp = 21, b.file = 0, b.gopher = 70, b.http = 80, b.https = 443, b.ws = 80, b.wss = 443;
			var C = Object.create(null);
			C["%2e"] = ".", C[".%2e"] = "..", C["%2e."] = "..", C["%2e%2e"] = "..";
			var S = void 0,
				P = /[a-zA-Z]/,
				E = /[a-zA-Z0-9\+\-\.]/;
			s.prototype = {
				toString: function () {
					return this.href
				},
				get href() {
					if (this._isInvalid) return this._url;
					var e = "";
					return "" == this._username && null == this._password || (e = this._username + (null != this._password ? ":" + this._password : "") + "@"), this.protocol + (this._isRelative ? "//" + e + this.host : "") + this.pathname + this._query + this._fragment
				},
				set href(e) {
					o.call(this), r.call(this, e)
				},
				get protocol() {
					return this._scheme + ":"
				},
				set protocol(e) {
					this._isInvalid || r.call(this, e + ":", "scheme start")
				},
				get host() {
					return this._isInvalid ? "" : this._port ? this._host + ":" + this._port : this._host
				},
				set host(e) {
					!this._isInvalid && this._isRelative && r.call(this, e, "host")
				},
				get hostname() {
					return this._host
				},
				set hostname(e) {
					!this._isInvalid && this._isRelative && r.call(this, e, "hostname")
				},
				get port() {
					return this._port
				},
				set port(e) {
					!this._isInvalid && this._isRelative && r.call(this, e, "port")
				},
				get pathname() {
					return this._isInvalid ? "" : this._isRelative ? "/" + this._path.join("/") : this._schemeData
				},
				set pathname(e) {
					!this._isInvalid && this._isRelative && (this._path = [], r.call(this, e, "relative path start"))
				},
				get search() {
					return this._isInvalid || !this._query || "?" == this._query ? "" : this._query
				},
				set search(e) {
					!this._isInvalid && this._isRelative && ((this._query = "?") == e[0] && (e = e.slice(1)), r.call(this, e, "query"))
				},
				get hash() {
					return this._isInvalid || !this._fragment || "#" == this._fragment ? "" : this._fragment
				},
				set hash(e) {
					this._isInvalid || ((this._fragment = "#") == e[0] && (e = e.slice(1)), r.call(this, e, "fragment"))
				},
				get origin() {
					var e;
					if (this._isInvalid || !this._scheme) return "";
					switch (this._scheme) {
						case "data":
						case "file":
						case "javascript":
						case "mailto":
							return "null"
					}
					return (e = this.host) ? this._scheme + "://" + e : ""
				}
			};
			var n = e.URL;
			n && (s.createObjectURL = function (e) {
				return n.createObjectURL.apply(n, arguments)
			}, s.revokeObjectURL = function (e) {
				n.revokeObjectURL(e)
			}), e.URL = s
		}

		function T(e) {
			return void 0 !== b[e]
		}

		function w() {
			o.call(this), this._isInvalid = !0
		}

		function R(e) {
			return "" == e && w.call(this), e.toLowerCase()
		}

		function x(e) {
			var t = e.charCodeAt(0);
			return 32 < t && t < 127 && -1 == [34, 35, 60, 62, 63, 96].indexOf(t) ? e : encodeURIComponent(e)
		}

		function r(e, t, i) {
			function n(e) {
				h.push(e)
			}
			var r, o, s = t || "scheme start",
				a = 0,
				c = "",
				l = !1,
				d = !1,
				h = [];
			e: for (;
				(e[a - 1] != S || 0 == a) && !this._isInvalid;) {
				var u = e[a];
				switch (s) {
					case "scheme start":
						if (!u || !P.test(u)) {
							if (t) {
								n("Invalid scheme.");
								break e
							}
							c = "", s = "no scheme";
							continue
						}
						c += u.toLowerCase(), s = "scheme";
						break;
					case "scheme":
						if (u && E.test(u)) c += u.toLowerCase();
						else {
							if (":" != u) {
								if (t) {
									if (S == u) break e;
									n("Code point not allowed in scheme: " + u);
									break e
								}
								c = "", a = 0, s = "no scheme";
								continue
							}
							if (this._scheme = c, c = "", t) break e;
							T(this._scheme) && (this._isRelative = !0), s = "file" == this._scheme ? "relative" : this._isRelative && i && i._scheme == this._scheme ? "relative or authority" : this._isRelative ? "authority first slash" : "scheme data"
						}
						break;
					case "scheme data":
						"?" == u ? (this._query = "?", s = "query") : "#" == u ? (this._fragment = "#", s = "fragment") : S != u && "\t" != u && "\n" != u && "\r" != u && (this._schemeData += x(u));
						break;
					case "no scheme":
						if (i && T(i._scheme)) {
							s = "relative";
							continue
						}
						n("Missing scheme."), w.call(this);
						break;
					case "relative or authority":
						if ("/" != u || "/" != e[a + 1]) {
							n("Expected /, got: " + u), s = "relative";
							continue
						}
						s = "authority ignore slashes";
						break;
					case "relative":
						if (this._isRelative = !0, "file" != this._scheme && (this._scheme = i._scheme), S == u) {
							this._host = i._host, this._port = i._port, this._path = i._path.slice(), this._query = i._query, this._username = i._username, this._password = i._password;
							break e
						}
						if ("/" == u || "\\" == u) "\\" == u && n("\\ is an invalid code point."), s = "relative slash";
						else if ("?" == u) this._host = i._host, this._port = i._port, this._path = i._path.slice(), this._query = "?", this._username = i._username, this._password = i._password, s = "query";
						else {
							if ("#" != u) {
								var p = e[a + 1],
									f = e[a + 2];
								("file" != this._scheme || !P.test(u) || ":" != p && "|" != p || S != f && "/" != f && "\\" != f && "?" != f && "#" != f) && (this._host = i._host, this._port = i._port, this._username = i._username, this._password = i._password, this._path = i._path.slice(), this._path.pop()), s = "relative path";
								continue
							}
							this._host = i._host, this._port = i._port, this._path = i._path.slice(), this._query = i._query, this._fragment = "#", this._username = i._username, this._password = i._password, s = "fragment"
						}
						break;
					case "relative slash":
						if ("/" != u && "\\" != u) {
							"file" != this._scheme && (this._host = i._host, this._port = i._port, this._username = i._username, this._password = i._password), s = "relative path";
							continue
						}
						"\\" == u && n("\\ is an invalid code point."), s = "file" == this._scheme ? "file host" : "authority ignore slashes";
						break;
					case "authority first slash":
						if ("/" != u) {
							n("Expected '/', got: " + u), s = "authority ignore slashes";
							continue
						}
						s = "authority second slash";
						break;
					case "authority second slash":
						if (s = "authority ignore slashes", "/" == u) break;
						n("Expected '/', got: " + u);
						continue;
					case "authority ignore slashes":
						if ("/" != u && "\\" != u) {
							s = "authority";
							continue
						}
						n("Expected authority, got: " + u);
						break;
					case "authority":
						if ("@" == u) {
							l && (n("@ already seen."), c += "%40"), l = !0;
							for (var m = 0; m < c.length; m++) {
								var v = c[m];
								if ("\t" != v && "\n" != v && "\r" != v)
									if (":" != v || null !== this._password) {
										var _ = x(v);
										null !== this._password ? this._password += _ : this._username += _
									}
									else this._password = "";
								else n("Invalid whitespace in authority.")
							}
							c = ""
						}
						else {
							if (S == u || "/" == u || "\\" == u || "?" == u || "#" == u) {
								a -= c.length, c = "", s = "host";
								continue
							}
							c += u
						}
						break;
					case "file host":
						if (S == u || "/" == u || "\\" == u || "?" == u || "#" == u) {
							s = 2 != c.length || !P.test(c[0]) || ":" != c[1] && "|" != c[1] ? (0 == c.length || (this._host = R.call(this, c), c = ""), "relative path start") : "relative path";
							continue
						}
						"\t" == u || "\n" == u || "\r" == u ? n("Invalid whitespace in file host.") : c += u;
						break;
					case "host":
					case "hostname":
						if (":" != u || d) {
							if (S == u || "/" == u || "\\" == u || "?" == u || "#" == u) {
								if (this._host = R.call(this, c), c = "", s = "relative path start", t) break e;
								continue
							}
							"\t" != u && "\n" != u && "\r" != u ? ("[" == u ? d = !0 : "]" == u && (d = !1), c += u) : n("Invalid code point in host/hostname: " + u)
						}
						else if (this._host = R.call(this, c), c = "", s = "port", "hostname" == t) break e;
						break;
					case "port":
						if (/[0-9]/.test(u)) c += u;
						else {
							if (S == u || "/" == u || "\\" == u || "?" == u || "#" == u || t) {
								if ("" != c) {
									var y = parseInt(c, 10);
									y != b[this._scheme] && (this._port = y + ""), c = ""
								}
								if (t) break e;
								s = "relative path start";
								continue
							}
							"\t" == u || "\n" == u || "\r" == u ? n("Invalid code point in port: " + u) : w.call(this)
						}
						break;
					case "relative path start":
						if ("\\" == u && n("'\\' not allowed in path."), s = "relative path", "/" != u && "\\" != u) continue;
						break;
					case "relative path":
						var g;
						if (S != u && "/" != u && "\\" != u && (t || "?" != u && "#" != u)) "\t" != u && "\n" != u && "\r" != u && (c += x(u));
						else "\\" == u && n("\\ not allowed in relative path."), (g = C[c.toLowerCase()]) && (c = g), ".." == c ? (this._path.pop(), "/" != u && "\\" != u && this._path.push("")) : "." == c && "/" != u && "\\" != u ? this._path.push("") : "." != c && ("file" == this._scheme && 0 == this._path.length && 2 == c.length && P.test(c[0]) && "|" == c[1] && (c = c[0] + ":"), this._path.push(c)), c = "", "?" == u ? (this._query = "?", s = "query") : "#" == u && (this._fragment = "#", s = "fragment");
						break;
					case "query":
						t || "#" != u ? S != u && "\t" != u && "\n" != u && "\r" != u && (this._query += (void 0, 32 < (o = (r = u).charCodeAt(0)) && o < 127 && -1 == [34, 35, 60, 62, 96].indexOf(o) ? r : encodeURIComponent(r))) : (this._fragment = "#", s = "fragment");
						break;
					case "fragment":
						S != u && "\t" != u && "\n" != u && "\r" != u && (this._fragment += u)
				}
				a++
			}
		}

		function o() {
			this._scheme = "", this._schemeData = "", this._username = "", this._password = null, this._host = "", this._port = "", this._path = [], this._query = "", this._fragment = "", this._isInvalid = !1, this._isRelative = !1
		}

		function s(e, t) {
			void 0 === t || t instanceof s || (t = new s(String(t))), this._url = e, o.call(this);
			var i = e.replace(/^[ \t\r\n\f]+|[ \t\r\n\f]+$/g, "");
			r.call(this, i, null, t)
		}
	}(self), "undefined" == typeof WeakMap && function () {
		function e() {
			this.name = "__st" + (1e9 * Math.random() >>> 0) + t++ + "__"
		}
		var n = Object.defineProperty,
			t = Date.now() % 1e9;
		e.prototype = {
			set: function (e, t) {
				var i = e[this.name];
				return i && i[0] === e ? i[1] = t : n(e, this.name,
					{
						value: [e, t],
						writable: !0
					}), this
			},
			get: function (e) {
				var t;
				return (t = e[this.name]) && t[0] === e ? t[1] : void 0
			},
			delete: function (e) {
				var t = e[this.name];
				return !(!t || t[0] !== e) && (t[0] = t[1] = void 0, !0)
			},
			has: function (e) {
				var t = e[this.name];
				return !!t && t[0] === e
			}
		}, window.WeakMap = e
	}(),
	function (e) {
		if (!e.JsMutationObserver) {
			var r, c = new WeakMap;
			if (/Trident|Edge/.test(navigator.userAgent)) r = setTimeout;
			else if (window.setImmediate) r = window.setImmediate;
			else {
				var i = [],
					n = String(Math.random());
				window.addEventListener("message", function (e) {
					if (e.data === n) {
						var t = i;
						i = [], t.forEach(function (e) {
							e()
						})
					}
				}), r = function (e) {
					i.push(e), window.postMessage(n, "*")
				}
			}
			var h, u, o = !1,
				s = [],
				t = 0;
			l.prototype = {
				observe: function (e, t) {
					if (e = function (e) {
						return window.ShadowDOMPolyfill && window.ShadowDOMPolyfill.wrapIfNeeded(e) || e
					}(e), !t.childList && !t.attributes && !t.characterData || t.attributeOldValue && !t.attributes || t.attributeFilter && t.attributeFilter.length && !t.attributes || t.characterDataOldValue && !t.characterData) throw new SyntaxError;
					var i, n = c.get(e);
					n || c.set(e, n = []);
					for (var r = 0; r < n.length; r++)
						if (n[r].observer === this) {
							(i = n[r]).removeListeners(), i.options = t;
							break
						} i || (i = new _(this, e, t), n.push(i), this.nodes_.push(e)), i.addListeners()
				},
				disconnect: function () {
					this.nodes_.forEach(function (e) {
						for (var t = c.get(e), i = 0; i < t.length; i++) {
							var n = t[i];
							if (n.observer === this) {
								n.removeListeners(), t.splice(i, 1);
								break
							}
						}
					}, this), this.records_ = []
				},
				takeRecords: function () {
					var e = this.records_;
					return this.records_ = [], e
				}
			}, _.prototype = {
				enqueue: function (e) {
					var t = this.observer.records_,
						i = t.length;
					if (0 < t.length) {
						var n = v(t[i - 1], e);
						if (n) return void (t[i - 1] = n)
					}
					else ! function (e) {
						s.push(e), o || (o = !0, r(a))
					}(this.observer);
					t[i] = e
				},
				addListeners: function () {
					this.addListeners_(this.target)
				},
				addListeners_: function (e) {
					var t = this.options;
					t.attributes && e.addEventListener("DOMAttrModified", this, !0), t.characterData && e.addEventListener("DOMCharacterDataModified", this, !0), t.childList && e.addEventListener("DOMNodeInserted", this, !0), (t.childList || t.subtree) && e.addEventListener("DOMNodeRemoved", this, !0)
				},
				removeListeners: function () {
					this.removeListeners_(this.target)
				},
				removeListeners_: function (e) {
					var t = this.options;
					t.attributes && e.removeEventListener("DOMAttrModified", this, !0), t.characterData && e.removeEventListener("DOMCharacterDataModified", this, !0), t.childList && e.removeEventListener("DOMNodeInserted", this, !0), (t.childList || t.subtree) && e.removeEventListener("DOMNodeRemoved", this, !0)
				},
				addTransientObserver: function (e) {
					if (e !== this.target) {
						this.addListeners_(e), this.transientObservedNodes.push(e);
						var t = c.get(e);
						t || c.set(e, t = []), t.push(this)
					}
				},
				removeTransientObservers: function () {
					var e = this.transientObservedNodes;
					this.transientObservedNodes = [], e.forEach(function (e) {
						this.removeListeners_(e);
						for (var t = c.get(e), i = 0; i < t.length; i++)
							if (t[i] === this) {
								t.splice(i, 1);
								break
							}
					}, this)
				},
				handleEvent: function (e) {
					switch (e.stopImmediatePropagation(), e.type) {
						case "DOMAttrModified":
							var t = e.attrName,
								i = e.relatedNode.namespaceURI,
								n = e.target;
							(o = new f("attributes", n)).attributeName = t, o.attributeNamespace = i;
							var r = e.attrChange === MutationEvent.ADDITION ? null : e.prevValue;
							p(n, function (e) {
								if (e.attributes && (!e.attributeFilter || !e.attributeFilter.length || -1 !== e.attributeFilter.indexOf(t) || -1 !== e.attributeFilter.indexOf(i))) return e.attributeOldValue ? m(r) : o
							});
							break;
						case "DOMCharacterDataModified":
							var o = f("characterData", n = e.target);
							r = e.prevValue;
							p(n, function (e) {
								if (e.characterData) return e.characterDataOldValue ? m(r) : o
							});
							break;
						case "DOMNodeRemoved":
							this.addTransientObserver(e.target);
						case "DOMNodeInserted":
							var s, a, c = e.target;
							a = "DOMNodeInserted" === e.type ? (s = [c], []) : (s = [], [c]);
							var l = c.previousSibling,
								d = c.nextSibling;
							(o = f("childList", e.target.parentNode)).addedNodes = s, o.removedNodes = a, o.previousSibling = l, o.nextSibling = d, p(e.relatedNode, function (e) {
								if (e.childList) return o
							})
					}
					h = u = void 0
				}
			}, e.JsMutationObserver = l, e.MutationObserver || ((e.MutationObserver = l)._isPolyfilled = !0)
		}

		function a() {
			o = !1;
			var e = s;
			s = [], e.sort(function (e, t) {
				return e.uid_ - t.uid_
			});
			var i = !1;
			e.forEach(function (e) {
				var t = e.takeRecords();
				! function (i) {
					i.nodes_.forEach(function (e) {
						var t = c.get(e);
						t && t.forEach(function (e) {
							e.observer === i && e.removeTransientObservers()
						})
					})
				}(e), t.length && (e.callback_(t, e), i = !0)
			}), i && a()
		}

		function p(e, t) {
			for (var i = e; i; i = i.parentNode) {
				var n = c.get(i);
				if (n)
					for (var r = 0; r < n.length; r++) {
						var o = n[r],
							s = o.options;
						if (i === e || s.subtree) {
							var a = t(s);
							a && o.enqueue(a)
						}
					}
			}
		}

		function l(e) {
			this.callback_ = e, this.nodes_ = [], this.records_ = [], this.uid_ = ++t
		}

		function d(e, t) {
			this.type = e, this.target = t, this.addedNodes = [], this.removedNodes = [], this.previousSibling = null, this.nextSibling = null, this.attributeName = null, this.attributeNamespace = null, this.oldValue = null
		}

		function f(e, t) {
			return h = new d(e, t)
		}

		function m(e) {
			return u || ((u = function (e) {
				var t = new d(e.type, e.target);
				return t.addedNodes = e.addedNodes.slice(), t.removedNodes = e.removedNodes.slice(), t.previousSibling = e.previousSibling, t.nextSibling = e.nextSibling, t.attributeName = e.attributeName, t.attributeNamespace = e.attributeNamespace, t.oldValue = e.oldValue, t
			}(h)).oldValue = e, u)
		}

		function v(e, t) {
			return e === t ? e : u && function (e) {
				return e === u || e === h
			}(e) ? u : null
		}

		function _(e, t, i) {
			this.observer = e, this.target = t, this.options = i, this.transientObservedNodes = []
		}
	}(self),
	function () {
		var i, n = "undefined" == typeof HTMLTemplateElement;
		/Trident/.test(navigator.userAgent) && (i = document.importNode, document.importNode = function () {
			var e = i.apply(document, arguments);
			if (e.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) return e;
			var t = document.createDocumentFragment();
			return t.appendChild(e), t
		});

		function o() { }
		var e = function () {
			if (!n) {
				var e = document.createElement("template"),
					t = document.createElement("template");
				t.content.appendChild(document.createElement("div")), e.content.appendChild(t);
				var i = e.cloneNode(!0);
				return 0 === i.content.childNodes.length || 0 === i.content.firstChild.content.childNodes.length
			}
		}(),
			c = "template";
		if (n) {
			var r = document.implementation.createHTMLDocument("template"),
				s = !0,
				t = document.createElement("style");
			t.textContent = c + "{display:none;}";
			var a = document.head;
			a.insertBefore(t, a.firstElementChild), o.prototype = Object.create(HTMLElement.prototype), o.decorate = function (e) {
				if (!e.content) {
					var t;
					for (e.content = r.createDocumentFragment(); t = e.firstChild;) e.content.appendChild(t);
					if (e.cloneNode = function (e) {
						return o.cloneNode(this, e)
					}, s) try {
							Object.defineProperty(e, "innerHTML",
								{
									get: function () {
										for (var e = "", t = this.content.firstChild; t; t = t.nextSibling) e += t.outerHTML || t.data.replace(d, h);
										return e
									},
									set: function (e) {
										for (r.body.innerHTML = e, o.bootstrap(r); this.content.firstChild;) this.content.removeChild(this.content.firstChild);
										for (; r.body.firstChild;) this.content.appendChild(r.body.firstChild)
									},
									configurable: !0
								})
						}
						catch (e) {
							s = !1
						}
					o.bootstrap(e.content)
				}
			}, o.bootstrap = function (e) {
				for (var t, i = e.querySelectorAll(c), n = 0, r = i.length; n < r && (t = i[n]); n++) o.decorate(t)
			}, document.addEventListener("DOMContentLoaded", function () {
				o.bootstrap(document)
			});
			var l = document.createElement;
			document.createElement = function () {
				"use strict";
				var e = l.apply(document, arguments);
				return "template" === e.localName && o.decorate(e), e
			};
			var d = /[&\u00A0<>]/g;

			function h(e) {
				switch (e) {
					case "&":
						return "&amp;";
					case "<":
						return "&lt;";
					case ">":
						return "&gt;";
					case " ":
						return "&nbsp;"
				}
			}
		}
		if (n || e) {
			var u = Node.prototype.cloneNode;
			o.cloneNode = function (e, t) {
				var i = u.call(e, !1);
				return this.decorate && this.decorate(i), t && (i.content.appendChild(u.call(e.content, !0)), this.fixClonedDom(i.content, e.content)), i
			}, o.fixClonedDom = function (e, t) {
				if (t.querySelectorAll)
					for (var i, n, r = t.querySelectorAll(c), o = e.querySelectorAll(c), s = 0, a = o.length; s < a; s++) n = r[s], i = o[s], this.decorate && this.decorate(n), i.parentNode.replaceChild(n.cloneNode(!0), i)
			};
			var p = document.importNode;
			Node.prototype.cloneNode = function (e) {
				var t = u.call(this, e);
				return e && o.fixClonedDom(t, this), t
			}, document.importNode = function (e, t) {
				if (e.localName === c) return o.cloneNode(e, t);
				var i = p.call(document, e, t);
				return t && o.fixClonedDom(i, e), i
			}, e && (HTMLTemplateElement.prototype.cloneNode = function (e) {
				return o.cloneNode(this, e)
			})
		}
		n && (window.HTMLTemplateElement = o)
	}(),
	function () {
		"use strict";
		if (!window.performance || !window.performance.now) {
			var e = Date.now();
			window.performance = {
				now: function () {
					return Date.now() - e
				}
			}
		}
		var t, i;
		if (window.requestAnimationFrame || (window.requestAnimationFrame = (t = window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame) ? function (e) {
			return t(function () {
				e(performance.now())
			})
		} : function (e) {
				return window.setTimeout(e, 1e3 / 60)
			}), window.cancelAnimationFrame || (window.cancelAnimationFrame = window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || function (e) {
				clearTimeout(e)
			}), !((i = document.createEvent("Event")).initEvent("foo", !0, !0), i.preventDefault(), i.defaultPrevented)) {
			var n = Event.prototype.preventDefault;
			Event.prototype.preventDefault = function () {
				this.cancelable && (n.call(this), Object.defineProperty(this, "defaultPrevented",
					{
						get: function () {
							return !0
						},
						configurable: !0
					}))
			}
		}
		var r = /Trident/.test(navigator.userAgent);
		if ((!window.CustomEvent || r && "function" != typeof window.CustomEvent) && (window.CustomEvent = function (e, t) {
			t = t ||
				{};
			var i = document.createEvent("CustomEvent");
			return i.initCustomEvent(e, Boolean(t.bubbles), Boolean(t.cancelable), t.detail), i
		}, window.CustomEvent.prototype = window.Event.prototype), !window.Event || r && "function" != typeof window.Event) {
			var o = window.Event;
			window.Event = function (e, t) {
				t = t ||
					{};
				var i = document.createEvent("Event");
				return i.initEvent(e, Boolean(t.bubbles), Boolean(t.cancelable)), i
			}, window.Event.prototype = o.prototype
		}
	}(window.WebComponents), window.HTMLImports = window.HTMLImports ||
	{
		flags:
			{}
	},
	function (e) {
		function t(e) {
			return i ? window.ShadowDOMPolyfill.wrapIfNeeded(e) : e
		}
		var p = Boolean("import" in document.createElement("link")),
			i = Boolean(window.ShadowDOMPolyfill),
			n = t(document),
			r = {
				get: function () {
					var e = window.HTMLImports.currentScript || document.currentScript || ("complete" !== document.readyState ? document.scripts[document.scripts.length - 1] : null);
					return t(e)
				},
				configurable: !0
			};
		Object.defineProperty(document, "_currentScript", r), Object.defineProperty(n, "_currentScript", r);
		var o = /Trident/.test(navigator.userAgent);

		function s(e, t) {
			(function e(t, i) {
				if (r = i, "complete" !== r.readyState && r.readyState !== a) {
					var n = function () {
						"complete" !== i.readyState && i.readyState !== a || (i.removeEventListener(c, n), e(t, i))
					};
					i.addEventListener(c, n)
				}
				else t && t();
				var r
			})(function () {
				! function (e, t) {
					var i = t.querySelectorAll("link[rel=import]"),
						n = 0,
						r = i.length,
						o = [],
						s = [];

					function a() {
						n == r && e && e(
							{
								allImports: i,
								loadedImports: o,
								errorImports: s
							})
					}

					function c(e) {
						f(e), o.push(this), n++, a()
					}

					function l(e) {
						s.push(this), n++, a()
					}
					if (r)
						for (var d, h = 0; h < r && (d = i[h]); h++) u = d, (p ? u.__loaded || u.import && "loading" !== u.import.readyState : u.__importParsed) ? (o.push(this), n++, a()) : (d.addEventListener("load", c), d.addEventListener("error", l));
					else a();
					var u
				}(e, t)
			}, t = t || n)
		}
		var a = o ? "complete" : "interactive",
			c = "readystatechange";

		function f(e) {
			e.target.__loaded = !0
		}
		if (p) {
			function l(e) {
				for (var t, i = 0, n = e.length; i < n && (t = e[i]); i++) "link" === (r = t).localName && "import" === r.rel && d(t);
				var r
			}

			function d(e) {
				e.import ? f(
					{
						target: e
					}) : (e.addEventListener("load", f), e.addEventListener("error", f))
			}
			new MutationObserver(function (e) {
				for (var t, i = 0, n = e.length; i < n && (t = e[i]); i++) t.addedNodes && l(t.addedNodes)
			}).observe(document.head,
				{
					childList: !0
				}),
				function () {
					if ("loading" === document.readyState)
						for (var e, t = document.querySelectorAll("link[rel=import]"), i = 0, n = t.length; i < n && (e = t[i]); i++) d(e)
				}()
		}
		s(function (e) {
			window.HTMLImports.ready = !0, window.HTMLImports.readyTime = (new Date).getTime();
			var t = n.createEvent("CustomEvent");
			t.initCustomEvent("HTMLImportsLoaded", !0, !0, e), n.dispatchEvent(t)
		}), e.IMPORT_LINK_TYPE = "import", e.useNative = p, e.rootDocument = n, e.whenReady = s, e.isIE = o
	}(window.HTMLImports),
	function (t) {
		var i = [];
		t.addModule = function (e) {
			i.push(e)
		}, t.initializeModules = function () {
			i.forEach(function (e) {
				e(t)
			})
		}
	}(window.HTMLImports), window.HTMLImports.addModule(function (e) {
		var r = /(url\()([^)]*)(\))/g,
			o = /(@import[\s]+(?!url\())([^;]*)(;)/g,
			t = {
				resolveUrlsInStyle: function (e, t) {
					var i = e.ownerDocument.createElement("a");
					return e.textContent = this.resolveUrlsInCssText(e.textContent, t, i), e
				},
				resolveUrlsInCssText: function (e, t, i) {
					var n = this.replaceUrls(e, i, t, r);
					return n = this.replaceUrls(n, i, t, o)
				},
				replaceUrls: function (e, o, s, t) {
					return e.replace(t, function (e, t, i, n) {
						var r = i.replace(/["']/g, "");
						return s && (r = new URL(r, s).href), o.href = r, t + "'" + (r = o.href) + "'" + n
					})
				}
			};
		e.path = t
	}), window.HTMLImports.addModule(function (t) {
		var s = {
			async: !0,
			ok: function (e) {
				return 200 <= e.status && e.status < 300 || 304 === e.status || 0 === e.status
			},
			load: function (e, n, r) {
				var o = new XMLHttpRequest;
				return (t.flags.debug || t.flags.bust) && (e += "?" + Math.random()), o.open("GET", e, s.async), o.addEventListener("readystatechange", function (e) {
					if (4 === o.readyState) {
						var t = null;
						try {
							var i = o.getResponseHeader("Location");
							i && (t = "/" === i.substr(0, 1) ? location.origin + i : i)
						}
						catch (e) {
							console.error(e.message)
						}
						n.call(r, !s.ok(o) && o, o.response || o.responseText, t)
					}
				}), o.send(), o
			},
			loadDocument: function (e, t, i) {
				this.load(e, t, i).responseType = "document"
			}
		};
		t.xhr = s
	}), window.HTMLImports.addModule(function (e) {
		function t(e, t) {
			this.cache = {}, this.onload = e, this.oncomplete = t, this.inflight = 0, this.pending = {}
		}
		var s = e.xhr,
			a = e.flags;
		t.prototype = {
			addNodes: function (e) {
				this.inflight += e.length;
				for (var t, i = 0, n = e.length; i < n && (t = e[i]); i++) this.require(t);
				this.checkDone()
			},
			addNode: function (e) {
				this.inflight++, this.require(e), this.checkDone()
			},
			require: function (e) {
				var t = e.src || e.href;
				e.__nodeUrl = t, this.dedupe(t, e) || this.fetch(t, e)
			},
			dedupe: function (e, t) {
				return this.pending[e] ? (this.pending[e].push(t), !0) : this.cache[e] ? (this.onload(e, t, this.cache[e]), this.tail(), !0) : !(this.pending[e] = [t])
			},
			fetch: function (n, r) {
				if (a.load && console.log("fetch", n, r), n)
					if (n.match(/^data:/)) {
						var e = n.split(","),
							t = e[0],
							i = e[1];
						i = -1 < t.indexOf(";base64") ? atob(i) : decodeURIComponent(i), setTimeout(function () {
							this.receive(n, r, null, i)
						}.bind(this), 0)
					}
					else {
						var o = function (e, t, i) {
							this.receive(n, r, e, t, i)
						}.bind(this);
						s.load(n, o)
					}
				else setTimeout(function () {
					this.receive(n, r,
						{
							error: "href must be specified"
						}, null)
				}.bind(this), 0)
			},
			receive: function (e, t, i, n, r) {
				this.cache[e] = n;
				for (var o, s = this.pending[e], a = 0, c = s.length; a < c && (o = s[a]); a++) this.onload(e, o, n, i, r), this.tail();
				this.pending[e] = null
			},
			tail: function () {
				--this.inflight, this.checkDone()
			},
			checkDone: function () {
				this.inflight || this.oncomplete()
			}
		}, e.Loader = t
	}), window.HTMLImports.addModule(function (e) {
		function t(e) {
			this.addCallback = e, this.mo = new MutationObserver(this.handler.bind(this))
		}
		t.prototype = {
			handler: function (e) {
				for (var t, i = 0, n = e.length; i < n && (t = e[i]); i++) "childList" === t.type && t.addedNodes.length && this.addedNodes(t.addedNodes)
			},
			addedNodes: function (e) {
				this.addCallback && this.addCallback(e);
				for (var t, i = 0, n = e.length; i < n && (t = e[i]); i++) t.children && t.children.length && this.addedNodes(t.children)
			},
			observe: function (e) {
				this.mo.observe(e,
					{
						childList: !0,
						subtree: !0
					})
			}
		}, e.Observer = t
	}), window.HTMLImports.addModule(function (i) {
		var n = i.path,
			t = i.rootDocument,
			r = i.flags,
			l = i.isIE,
			o = i.IMPORT_LINK_TYPE,
			e = "link[rel=" + o + "]",
			s = {
				documentSelectors: e,
				importsSelectors: [e, "link[rel=stylesheet]:not([type])", "style:not([type])", "script:not([type])", 'script[type="application/javascript"]', 'script[type="text/javascript"]'].join(","),
				map:
				{
					link: "parseLink",
					script: "parseScript",
					style: "parseStyle"
				},
				dynamicElements: [],
				parseNext: function () {
					var e = this.nextToParse();
					e && this.parse(e)
				},
				parse: function (e) {
					if (this.isParsed(e)) r.parse && console.log("[%s] is already parsed", e.localName);
					else {
						var t = this[this.map[e.localName]];
						t && (this.markParsing(e), t.call(this, e))
					}
				},
				parseDynamic: function (e, t) {
					this.dynamicElements.push(e), t || this.parseNext()
				},
				markParsing: function (e) {
					r.parse && console.log("parsing", e), this.parsingElement = e
				},
				markParsingComplete: function (e) {
					e.__importParsed = !0, this.markDynamicParsingComplete(e), e.__importElement && (e.__importElement.__importParsed = !0, this.markDynamicParsingComplete(e.__importElement)), this.parsingElement = null, r.parse && console.log("completed", e)
				},
				markDynamicParsingComplete: function (e) {
					var t = this.dynamicElements.indexOf(e);
					0 <= t && this.dynamicElements.splice(t, 1)
				},
				parseImport: function (e) {
					if (e.import = e.__doc, window.HTMLImports.__importsParsingHook && window.HTMLImports.__importsParsingHook(e), e.import && (e.import.__importParsed = !0), this.markParsingComplete(e), e.__resource && !e.__error ? e.dispatchEvent(new CustomEvent("load",
						{
							bubbles: !1
						})) : e.dispatchEvent(new CustomEvent("error",
							{
								bubbles: !1
							})), e.__pending)
						for (var t; e.__pending.length;)(t = e.__pending.shift()) && t(
							{
								target: e
							});
					this.parseNext()
				},
				parseLink: function (e) {
					a(e) ? this.parseImport(e) : (e.href = e.href, this.parseGeneric(e))
				},
				parseStyle: function (e) {
					var t = e;
					e = function (e) {
						var t = e.ownerDocument.createElement("style");
						return t.textContent = e.textContent, n.resolveUrlsInStyle(t), t
					}(e), (t.__appliedElement = e).__importElement = t, this.parseGeneric(e)
				},
				parseGeneric: function (e) {
					this.trackElement(e), this.addElementToDocument(e)
				},
				rootImportForElement: function (e) {
					for (var t = e; t.ownerDocument.__importLink;) t = t.ownerDocument.__importLink;
					return t
				},
				addElementToDocument: function (e) {
					var t = this.rootImportForElement(e.__importElement || e);
					t.parentNode.insertBefore(e, t)
				},
				trackElement: function (t, i) {
					var n = this,
						r = function (e) {
							t.removeEventListener("load", r), t.removeEventListener("error", r), i && i(e), n.markParsingComplete(t), n.parseNext()
						};
					if (t.addEventListener("load", r), t.addEventListener("error", r), l && "style" === t.localName) {
						var e = !1;
						if (-1 == t.textContent.indexOf("@import")) e = !0;
						else if (t.sheet) {
							e = !0;
							for (var o, s = t.sheet.cssRules, a = s ? s.length : 0, c = 0; c < a && (o = s[c]); c++) o.type === CSSRule.IMPORT_RULE && (e = e && Boolean(o.styleSheet))
						}
						e && setTimeout(function () {
							t.dispatchEvent(new CustomEvent("load",
								{
									bubbles: !1
								}))
						})
					}
				},
				parseScript: function (e) {
					var t = document.createElement("script");
					t.__importElement = e, t.src = e.src ? e.src : function (e) {
						var t = function (e) {
							return e.textContent + function (e) {
								var t = e.ownerDocument;
								t.__importedScripts = t.__importedScripts || 0;
								var i = e.ownerDocument.baseURI,
									n = t.__importedScripts ? "-" + t.__importedScripts : "";
								return t.__importedScripts++, "\n//# sourceURL=" + i + n + ".js\n"
							}(e)
						}(e);
						return "data:text/javascript;charset=utf-8," + encodeURIComponent(t)
					}(e), i.currentScript = e, this.trackElement(t, function (e) {
						t.parentNode && t.parentNode.removeChild(t), i.currentScript = null
					}), this.addElementToDocument(t)
				},
				nextToParse: function () {
					return this._mayParse = [], !this.parsingElement && (this.nextToParseInDoc(t) || this.nextToParseDynamic())
				},
				nextToParseInDoc: function (e, t) {
					if (e && this._mayParse.indexOf(e) < 0) {
						this._mayParse.push(e);
						for (var i, n = e.querySelectorAll(this.parseSelectorsForNode(e)), r = 0, o = n.length; r < o && (i = n[r]); r++)
							if (!this.isParsed(i)) return this.hasResource(i) ? a(i) ? this.nextToParseInDoc(i.__doc, i) : i : void 0
					}
					return t
				},
				nextToParseDynamic: function () {
					return this.dynamicElements[0]
				},
				parseSelectorsForNode: function (e) {
					return (e.ownerDocument || e) === t ? this.documentSelectors : this.importsSelectors
				},
				isParsed: function (e) {
					return e.__importParsed
				},
				needsDynamicParsing: function (e) {
					return 0 <= this.dynamicElements.indexOf(e)
				},
				hasResource: function (e) {
					return !a(e) || void 0 !== e.__doc
				}
			};

		function a(e) {
			return "link" === e.localName && e.rel === o
		}
		i.parser = s, i.IMPORT_SELECTOR = e
	}), window.HTMLImports.addModule(function (e) {
		var s = e.flags,
			a = e.IMPORT_LINK_TYPE,
			t = e.IMPORT_SELECTOR,
			i = e.rootDocument,
			n = e.Loader,
			r = e.Observer,
			c = e.parser,
			o = {
				documents:
					{},
				documentPreloadSelectors: t,
				importsPreloadSelectors: [t].join(","),
				loadNode: function (e) {
					l.addNode(e)
				},
				loadSubtree: function (e) {
					var t = this.marshalNodes(e);
					l.addNodes(t)
				},
				marshalNodes: function (e) {
					return e.querySelectorAll(this.loadSelectorsForNode(e))
				},
				loadSelectorsForNode: function (e) {
					return (e.ownerDocument || e) === i ? this.documentPreloadSelectors : this.importsPreloadSelectors
				},
				loaded: function (e, t, i, n, r) {
					if (s.load && console.log("loaded", e, t), t.__resource = i, t.__error = n, function (e) {
						return function (e, t) {
							return "link" === e.localName && e.getAttribute("rel") === t
						}(e, a)
					}(t)) {
						var o = this.documents[e];
						void 0 === o && ((o = n ? null : function (e, t) {
							var i = document.implementation.createHTMLDocument(a);
							i._URL = t;
							var n = i.createElement("base");
							n.setAttribute("href", t), i.baseURI || function (e) {
								return !!Object.getOwnPropertyDescriptor(e, "baseURI")
							}(i) || Object.defineProperty(i, "baseURI",
								{
									value: t
								});
							var r = i.createElement("meta");
							r.setAttribute("charset", "utf-8"), i.head.appendChild(r), i.head.appendChild(n), i.body.innerHTML = e, window.HTMLTemplateElement && HTMLTemplateElement.bootstrap && HTMLTemplateElement.bootstrap(i);
							return i
						}(i, r || e)) && (o.__importLink = t, this.bootDocument(o)), this.documents[e] = o), t.__doc = o
					}
					c.parseNext()
				},
				bootDocument: function (e) {
					this.loadSubtree(e), this.observer.observe(e), c.parseNext()
				},
				loadedAll: function () {
					c.parseNext()
				}
			},
			l = new n(o.loaded.bind(o), o.loadedAll.bind(o));
		if (o.observer = new r, !document.baseURI) {
			var d = {
				get: function () {
					var e = document.querySelector("base");
					return e ? e.href : window.location.href
				},
				configurable: !0
			};
			Object.defineProperty(document, "baseURI", d), Object.defineProperty(i, "baseURI", d)
		}
		e.importer = o, e.importLoader = l
	}), window.HTMLImports.addModule(function (e) {
		var a = e.parser,
			c = e.importer,
			t = {
				added: function (e) {
					for (var t, i, n, r, o = 0, s = e.length; o < s && (r = e[o]); o++) t || (t = r.ownerDocument, i = a.isParsed(t)), (n = this.shouldLoadNode(r)) && c.loadNode(r), this.shouldParseNode(r) && i && a.parseDynamic(r, n)
				},
				shouldLoadNode: function (e) {
					return 1 === e.nodeType && i.call(e, c.loadSelectorsForNode(e))
				},
				shouldParseNode: function (e) {
					return 1 === e.nodeType && i.call(e, a.parseSelectorsForNode(e))
				}
			};
		c.observer.addCallback = t.added.bind(t);
		var i = HTMLElement.prototype.matches || HTMLElement.prototype.matchesSelector || HTMLElement.prototype.webkitMatchesSelector || HTMLElement.prototype.mozMatchesSelector || HTMLElement.prototype.msMatchesSelector
	}),
	function (e) {
		var t = e.initializeModules;
		e.isIE;
		if (!e.useNative) {
			t();
			var i = e.rootDocument;
			"complete" === document.readyState || "interactive" === document.readyState && !window.attachEvent ? n() : document.addEventListener("DOMContentLoaded", n)
		}

		function n() {
			window.HTMLImports.importer.bootDocument(i)
		}
	}(window.HTMLImports), window.CustomElements = window.CustomElements ||
	{
		flags:
			{}
	},
	function (t) {
		var e = t.flags,
			i = [];
		t.addModule = function (e) {
			i.push(e)
		}, t.initializeModules = function () {
			i.forEach(function (e) {
				e(t)
			})
		}, t.hasNative = Boolean(document.registerElement), t.isIE = /Trident/.test(navigator.userAgent), t.useNative = !e.register && t.hasNative && !window.ShadowDOMPolyfill && (!window.HTMLImports || window.HTMLImports.useNative)
	}(window.CustomElements), window.CustomElements.addModule(function (e) {
		var c = window.HTMLImports ? window.HTMLImports.IMPORT_LINK_TYPE : "none";

		function n(e, t) {
			! function e(t, i, n) {
				var r = t.firstElementChild;
				if (!r)
					for (r = t.firstChild; r && r.nodeType !== Node.ELEMENT_NODE;) r = r.nextSibling;
				for (; r;) !0 !== i(r, n) && e(r, i, n), r = r.nextElementSibling;
				return null
			}(e, function (e) {
				if (t(e)) return !0;
				i(e, t)
			}), i(e, t)
		}

		function i(e, t) {
			for (var i = e.shadowRoot; i;) n(i, t), i = i.olderShadowRoot
		}
		e.forDocumentTree = function (e, t) {
			! function e(t, i, n) {
				t = window.wrap(t);
				if (0 <= n.indexOf(t)) return;
				n.push(t);
				var r = t.querySelectorAll("link[rel=" + c + "]");
				for (var o, s = 0, a = r.length; s < a && (o = r[s]); s++) o.import && e(o.import, i, n);
				i(t)
			}(e, t, [])
		}, e.forSubtree = n
	}), window.CustomElements.addModule(function (i) {
		var s = i.flags,
			a = i.forSubtree,
			t = i.forDocumentTree;

		function c(e, t) {
			return n(e, t) || r(e, t)
		}

		function n(e, t) {
			if (i.upgrade(e, t)) return !0;
			t && p(e)
		}

		function r(e, t) {
			a(e, function (e) {
				if (n(e, t)) return !0
			})
		}
		var o = window.MutationObserver._isPolyfilled && s["throttle-attached"];
		i.hasPolyfillMutations = o, i.hasThrottledAttached = o;
		var l = !1,
			d = [];

		function h(e) {
			d.push(e), l || (l = !0, setTimeout(u))
		}

		function u() {
			l = !1;
			for (var e, t = d, i = 0, n = t.length; i < n && (e = t[i]); i++) e();
			d = []
		}

		function p(e) {
			o ? h(function () {
				f(e)
			}) : f(e)
		}

		function f(e) {
			e.__upgraded__ && !e.__attached && (e.__attached = !0, e.attachedCallback && e.attachedCallback())
		}

		function m(e) {
			o ? h(function () {
				v(e)
			}) : v(e)
		}

		function v(e) {
			e.__upgraded__ && e.__attached && (e.__attached = !1, e.detachedCallback && e.detachedCallback())
		}

		function _(e, t) {
			if (s.dom) {
				var i = t[0];
				if (i && "childList" === i.type && i.addedNodes && i.addedNodes) {
					for (var n = i.addedNodes[0]; n && n !== document && !n.host;) n = n.parentNode;
					var r = n && (n.URL || n._URL || n.host && n.host.localName) || "";
					r = r.split("/?").shift().split("/").pop()
				}
				console.group("mutations (%d) [%s]", t.length, r || "")
			}
			var o = function (e) {
				for (var t = e, i = window.wrap(document); t;) {
					if (t == i) return !0;
					t = t.parentNode || t.nodeType === Node.DOCUMENT_FRAGMENT_NODE && t.host
				}
			}(e);
			t.forEach(function (e) {
				"childList" === e.type && (y(e.addedNodes, function (e) {
					e.localName && c(e, o)
				}), y(e.removedNodes, function (e) {
					e.localName && function (e) {
						m(e), a(e, function (e) {
							m(e)
						})
					}(e)
				}))
			}), s.dom && console.groupEnd()
		}
		var y = Array.prototype.forEach.call.bind(Array.prototype.forEach);

		function g(e) {
			if (!e.__observer) {
				var t = new MutationObserver(_.bind(this, e));
				t.observe(e,
					{
						childList: !0,
						subtree: !0
					}), e.__observer = t
			}
		}

		function b(e) {
			e = window.wrap(e), s.dom && console.group("upgradeDocument: ", e.baseURI.split("/").pop()), c(e, e === window.wrap(document)), g(e), s.dom && console.groupEnd()
		}
		var C = Element.prototype.createShadowRoot;
		C && (Element.prototype.createShadowRoot = function () {
			var e = C.call(this);
			return window.CustomElements.watchShadow(this), e
		}), i.watchShadow = function (e) {
			if (e.shadowRoot && !e.shadowRoot.__watched) {
				s.dom && console.log("watching shadow-root for: ", e.localName);
				for (var t = e.shadowRoot; t;) g(t), t = t.olderShadowRoot
			}
		}, i.upgradeDocumentTree = function (e) {
			t(e, b)
		}, i.upgradeDocument = b, i.upgradeSubtree = r, i.upgradeAll = c, i.attached = p, i.takeRecords = function (e) {
			for (e = (e = window.wrap(e)) || window.wrap(document); e.parentNode;) e = e.parentNode;
			var t = e.__observer;
			t && (_(e, t.takeRecords()), u())
		}
	}), window.CustomElements.addModule(function (r) {
		var n = r.flags;

		function o(e, t, i) {
			return n.upgrade && console.group("upgrade:", e.localName), t.is && e.setAttribute("is", t.is), s(e, t), e.__upgraded__ = !0,
				function (e) {
					e.createdCallback && e.createdCallback()
				}(e), i && r.attached(e), r.upgradeSubtree(e, i), n.upgrade && console.groupEnd(), e
		}

		function s(e, t) {
			Object.__proto__ || function (e, t, i) {
				var n = {},
					r = t;
				for (; r !== i && r !== HTMLElement.prototype;) {
					for (var o, s = Object.getOwnPropertyNames(r), a = 0; o = s[a]; a++) n[o] || (Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(r, o)), n[o] = 1);
					r = Object.getPrototypeOf(r)
				}
			}(e, t.prototype, t.native), e.__proto__ = t.prototype
		}
		r.upgrade = function (e, t) {
			if ("template" === e.localName && window.HTMLTemplateElement && HTMLTemplateElement.decorate && HTMLTemplateElement.decorate(e), !e.__upgraded__ && e.nodeType === Node.ELEMENT_NODE) {
				var i = e.getAttribute("is"),
					n = r.getRegisteredDefinition(e.localName) || r.getRegisteredDefinition(i);
				if (n && (i && n.tag == e.localName || !i && !n.extends)) return o(e, n, t)
			}
		}, r.upgradeWithDefinition = o, r.implementPrototype = s
	}), window.CustomElements.addModule(function (n) {
		n.isIE;
		var r = n.upgradeDocumentTree,
			o = n.upgradeAll,
			s = n.upgradeWithDefinition,
			a = n.implementPrototype,
			e = n.useNative;

		function c(e, t, i) {
			e = e.toLowerCase();
			var n = this.getAttribute(e);
			i.apply(this, arguments);
			var r = this.getAttribute(e);
			this.attributeChangedCallback && r !== n && this.attributeChangedCallback(e, n, r)
		}
		var l = ["annotation-xml", "color-profile", "font-face", "font-face-src", "font-face-uri", "font-face-format", "font-face-name", "missing-glyph"];
		var d = {};

		function h(e) {
			if (e) return d[e.toLowerCase()]
		}

		function u(e, t) {
			e = e && e.toLowerCase();
			var i, n = h((t = t && t.toLowerCase()) || e);
			if (n) {
				if (e == n.tag && t == n.is) return new n.ctor;
				if (!t && !n.is) return new n.ctor
			}
			return t ? (i = u(e)).setAttribute("is", t) : (i = p(e), 0 <= e.indexOf("-") && a(i, HTMLElement)), i
		}
		var t, p = document.createElement.bind(document),
			f = document.createElementNS.bind(document);

		function i(e, t) {
			var i = e[t];
			e[t] = function () {
				var e = i.apply(this, arguments);
				return o(e), e
			}
		}
		t = Object.__proto__ || e ? function (e, t) {
			return e instanceof t
		} : function (e, t) {
				if (e instanceof t) return !0;
				for (var i = e; i;) {
					if (i === t.prototype) return !0;
					i = i.__proto__
				}
				return !1
			}, i(Node.prototype, "cloneNode"), i(document, "importNode"), document.registerElement = function (e, t) {
				var i = t ||
					{};
				if (!e) throw new Error("document.registerElement: first argument `name` must not be empty");
				if (e.indexOf("-") < 0) throw new Error("document.registerElement: first argument ('name') must contain a dash ('-'). Argument provided was '" + String(e) + "'.");
				if (function (e) {
					for (var t = 0; t < l.length; t++)
						if (e === l[t]) return !0
				}(e)) throw new Error("Failed to execute 'registerElement' on 'Document': Registration failed for type '" + String(e) + "'. The type name is invalid.");
				if (h(e)) throw new Error("DuplicateDefinitionError: a type with name '" + String(e) + "' is already registered");
				return i.prototype || (i.prototype = Object.create(HTMLElement.prototype)), i.__name = e.toLowerCase(), i.extends && (i.extends = i.extends.toLowerCase()), i.lifecycle = i.lifecycle ||
					{}, i.ancestry = function e(t) {
						var i = h(t);
						if (i) return e(i.extends).concat([i]);
						return []
					}(i.extends),
					function (e) {
						for (var t, i = e.extends, n = 0; t = e.ancestry[n]; n++) i = t.is && t.tag;
						e.tag = i || e.__name, i && (e.is = e.__name)
					}(i),
					function (e) {
						if (!Object.__proto__) {
							var t = HTMLElement.prototype;
							if (e.is) {
								var i = document.createElement(e.tag);
								t = Object.getPrototypeOf(i)
							}
							for (var n, r = e.prototype, o = !1; r;) r == t && (o = !0), (n = Object.getPrototypeOf(r)) && (r.__proto__ = n), r = n;
							o || console.warn(e.tag + " prototype not found in prototype chain for " + e.is), e.native = t
						}
					}(i),
					function (e) {
						if (e.setAttribute._polyfilled) return;
						var i = e.setAttribute;
						e.setAttribute = function (e, t) {
							c.call(this, e, t, i)
						};
						var t = e.removeAttribute;
						e.removeAttribute = function (e) {
							c.call(this, e, null, t)
						}, e.setAttribute._polyfilled = !0
					}(i.prototype),
					function (e, t) {
						d[e] = t
					}(i.__name, i), i.ctor = function (e) {
						return function () {
							return function (e) {
								return s(p(e.tag), e)
							}(e)
						}
					}(i), i.ctor.prototype = i.prototype, i.prototype.constructor = i.ctor, n.ready && r(document), i.ctor
			}, document.createElement = u, document.createElementNS = function (e, t, i) {
				return "http://www.w3.org/1999/xhtml" === e ? u(t, i) : f(e, t)
			}, n.registry = d, n.instanceof = t, n.reservedTagList = l, n.getRegisteredDefinition = h, document.register = document.registerElement
	}),
	function (e) {
		var t = e.useNative,
			i = e.initializeModules;
		e.isIE;
		if (t) {
			function n() { }
			e.watchShadow = n, e.upgrade = n, e.upgradeAll = n, e.upgradeDocumentTree = n, e.upgradeSubtree = n, e.takeRecords = n, e.instanceof = function (e, t) {
				return e instanceof t
			}
		}
		else i();
		var r = e.upgradeDocumentTree,
			o = e.upgradeDocument;

		function s() {
			r(window.wrap(document)), window.CustomElements.ready = !0, (window.requestAnimationFrame || function (e) {
				setTimeout(e, 16)
			})(function () {
				setTimeout(function () {
					window.CustomElements.readyTime = Date.now(), window.HTMLImports && (window.CustomElements.elapsed = window.CustomElements.readyTime - window.HTMLImports.readyTime), document.dispatchEvent(new CustomEvent("WebComponentsReady",
						{
							bubbles: !0
						}))
				})
			})
		}
		if (window.wrap || (window.ShadowDOMPolyfill ? (window.wrap = window.ShadowDOMPolyfill.wrapIfNeeded, window.unwrap = window.ShadowDOMPolyfill.unwrapIfNeeded) : window.wrap = window.unwrap = function (e) {
			return e
		}), window.HTMLImports && (window.HTMLImports.__importsParsingHook = function (e) {
			e.import && o(wrap(e.import))
		}), "complete" === document.readyState || e.flags.eager) s();
		else if ("interactive" !== document.readyState || window.attachEvent || window.HTMLImports && !window.HTMLImports.ready) {
			var a = window.HTMLImports && !window.HTMLImports.ready ? "HTMLImportsLoaded" : "DOMContentLoaded";
			window.addEventListener(a, s)
		}
		else s()
	}(window.CustomElements),
	function () {
		var e = document.createElement("style");
		e.textContent = "body {transition: opacity ease-in 0.2s; } \nbody[unresolved] {opacity: 0; display: block; overflow: hidden; position: relative; } \n";
		var t = document.querySelector("head");
		t.insertBefore(e, t.firstChild)
	}(window.WebComponents),
	function () {
		function e() {
			document.body.removeAttribute("unresolved")
		}
		window.WebComponents ? addEventListener("WebComponentsReady", e) : "interactive" === document.readyState || "complete" === document.readyState ? e() : addEventListener("DOMContentLoaded", e)
	}(), window.Polymer = {
		Settings: function () {
			var e = window.Polymer ||
				{};
			if (!e.noUrlSettings)
				for (var t, i = location.search.slice(1).split("&"), n = 0; n < i.length && (t = i[n]); n++)(t = t.split("="))[0] && (e[t[0]] = t[1] || !0);
			return e.wantShadow = "shadow" === e.dom, e.hasShadow = Boolean(Element.prototype.createShadowRoot), e.nativeShadow = e.hasShadow && !window.ShadowDOMPolyfill, e.useShadow = e.wantShadow && e.hasShadow, e.hasNativeImports = Boolean("import" in document.createElement("link")), e.useNativeImports = e.hasNativeImports, e.useNativeCustomElements = !window.CustomElements || window.CustomElements.useNative, e.useNativeShadow = e.useShadow && e.nativeShadow, e.usePolyfillProto = !e.useNativeCustomElements && !Object.__proto__, e.hasNativeCSSProperties = !navigator.userAgent.match(/AppleWebKit\/601|Edge\/15/) && window.CSS && CSS.supports && CSS.supports("box-shadow", "0 0 0 var(--foo)"), e.useNativeCSSProperties = e.hasNativeCSSProperties && e.lazyRegister && e.useNativeCSSProperties, e.isIE = navigator.userAgent.match("Trident"), e.passiveTouchGestures = e.passiveTouchGestures || !1, e
		}()
	},
	function () {
		var e = window.Polymer;
		window.Polymer = function (e) {
			"function" == typeof e && (e = e.prototype);
			var t = (e = r(e = e ||
				{})) === e.constructor.prototype ? e.constructor : null,
				i = {
					prototype: e
				};
			e.extends && (i.extends = e.extends), Polymer.telemetry._registrate(e);
			var n = document.registerElement(e.is, i);
			return t || n
		};
		var r = function (e) {
			var t = Polymer.Base;
			return e.extends && (t = Polymer.Base._getExtendedPrototype(e.extends)), (e = Polymer.Base.chainObject(e, t)).registerCallback(), e
		};
		if (e)
			for (var t in e) Polymer[t] = e[t];
		Polymer.Class = function (e) {
			return e.factoryImpl || (e.factoryImpl = function () { }), r(e).constructor
		}
	}(), Polymer.telemetry = {
		registrations: [],
		_regLog: function (e) {
			console.log("[" + e.is + "]: registered")
		},
		_registrate: function (e) {
			this.registrations.push(e), Polymer.log && this._regLog(e)
		},
		dumpRegistrations: function () {
			this.registrations.forEach(this._regLog)
		}
	}, Object.defineProperty(window, "currentImport",
		{
			enumerable: !0,
			configurable: !0,
			get: function () {
				return (document._currentScript || document.currentScript ||
					{}).ownerDocument
			}
		}), Polymer.RenderStatus = {
			_ready: !1,
			_callbacks: [],
			whenReady: function (e) {
				this._ready ? e() : this._callbacks.push(e)
			},
			_makeReady: function () {
				this._ready = !0;
				for (var e = 0; e < this._callbacks.length; e++) this._callbacks[e]();
				this._callbacks = []
			},
			_catchFirstRender: function () {
				requestAnimationFrame(function () {
					Polymer.RenderStatus._makeReady()
				})
			},
			_afterNextRenderQueue: [],
			_waitingNextRender: !1,
			afterNextRender: function (e, t, i) {
				this._watchNextRender(), this._afterNextRenderQueue.push([e, t, i])
			},
			hasRendered: function () {
				return this._ready
			},
			_watchNextRender: function () {
				if (!this._waitingNextRender) {
					this._waitingNextRender = !0;

					function e() {
						Polymer.RenderStatus._flushNextRender()
					}
					this._ready ? requestAnimationFrame(e) : this.whenReady(e)
				}
			},
			_flushNextRender: function () {
				var e = this;
				setTimeout(function () {
					e._flushRenderCallbacks(e._afterNextRenderQueue), e._afterNextRenderQueue = [], e._waitingNextRender = !1
				})
			},
			_flushRenderCallbacks: function (e) {
				for (var t, i = 0; i < e.length; i++)(t = e[i])[1].apply(t[0], t[2] || Polymer.nar)
			}
		}, window.HTMLImports ? HTMLImports.whenReady(function () {
			Polymer.RenderStatus._catchFirstRender()
		}) : Polymer.RenderStatus._catchFirstRender(), Polymer.ImportStatus = Polymer.RenderStatus, Polymer.ImportStatus.whenLoaded = Polymer.ImportStatus.whenReady,
	function () {
		"use strict";
		var e, o = Polymer.Settings;
		if (Polymer.Base = {
			__isPolymerInstance__: !0,
			_addFeature: function (e) {
				this.mixin(this, e)
			},
			registerCallback: function () {
				if ("max" === o.lazyRegister) this.beforeRegister && this.beforeRegister();
				else {
					this._desugarBehaviors();
					for (var e, t = 0; t < this.behaviors.length; t++)(e = this.behaviors[t]).beforeRegister && e.beforeRegister.call(this);
					this.beforeRegister && this.beforeRegister()
				}
				this._registerFeatures(), o.lazyRegister || this.ensureRegisterFinished()
			},
			createdCallback: function () {
				if (o.disableUpgradeEnabled) {
					if (this.hasAttribute("disable-upgrade")) return this._propertySetter = e, this._configValue = null, void (this.__data__ = {});
					this.__hasInitialized = !0
				}
				this.__initialize()
			},
			__initialize: function () {
				this.__hasRegisterFinished || this._ensureRegisterFinished(this.__proto__), Polymer.telemetry.instanceCount++, this.root = this;
				for (var e, t = 0; t < this.behaviors.length; t++)(e = this.behaviors[t]).created && e.created.call(this);
				this.created && this.created(), this._initFeatures()
			},
			ensureRegisterFinished: function () {
				this._ensureRegisterFinished(this)
			},
			_ensureRegisterFinished: function (e) {
				if (e.__hasRegisterFinished !== e.is || !e.is) {
					if ("max" === o.lazyRegister) {
						e._desugarBehaviors();
						for (var t, i = 0; i < e.behaviors.length; i++)(t = e.behaviors[i]).beforeRegister && t.beforeRegister.call(e)
					}
					e.__hasRegisterFinished = e.is, e._finishRegisterFeatures && e._finishRegisterFeatures();
					for (var n, r = 0; r < e.behaviors.length; r++)(n = e.behaviors[r]).registered && n.registered.call(e);
					e.registered && e.registered(), o.usePolyfillProto && e !== this && e.extend(this, e)
				}
			},
			attachedCallback: function () {
				var i = this;
				Polymer.RenderStatus.whenReady(function () {
					i.isAttached = !0;
					for (var e, t = 0; t < i.behaviors.length; t++)(e = i.behaviors[t]).attached && e.attached.call(i);
					i.attached && i.attached()
				})
			},
			detachedCallback: function () {
				var i = this;
				Polymer.RenderStatus.whenReady(function () {
					i.isAttached = !1;
					for (var e, t = 0; t < i.behaviors.length; t++)(e = i.behaviors[t]).detached && e.detached.call(i);
					i.detached && i.detached()
				})
			},
			attributeChangedCallback: function (e, t, i) {
				this._attributeChangedImpl(e);
				for (var n, r = 0; r < this.behaviors.length; r++)(n = this.behaviors[r]).attributeChanged && n.attributeChanged.call(this, e, t, i);
				this.attributeChanged && this.attributeChanged(e, t, i)
			},
			_attributeChangedImpl: function (e) {
				this._setAttributeToProperty(this, e)
			},
			extend: function (e, t) {
				if (e && t)
					for (var i, n = Object.getOwnPropertyNames(t), r = 0; r < n.length && (i = n[r]); r++) this.copyOwnProperty(i, t, e);
				return e || t
			},
			mixin: function (e, t) {
				for (var i in t) e[i] = t[i];
				return e
			},
			copyOwnProperty: function (e, t, i) {
				var n = Object.getOwnPropertyDescriptor(t, e);
				n && Object.defineProperty(i, e, n)
			},
			_logger: function (e, t) {
				switch (1 === t.length && Array.isArray(t[0]) && (t = t[0]), e) {
					case "log":
					case "warn":
					case "error":
						console[e].apply(console, t)
				}
			},
			_log: function () {
				var e = Array.prototype.slice.call(arguments, 0);
				this._logger("log", e)
			},
			_warn: function () {
				var e = Array.prototype.slice.call(arguments, 0);
				this._logger("warn", e)
			},
			_error: function () {
				var e = Array.prototype.slice.call(arguments, 0);
				this._logger("error", e)
			},
			_logf: function () {
				return this._logPrefix.concat(this.is).concat(Array.prototype.slice.call(arguments, 0))
			}
		}, Polymer.Base._logPrefix = window.chrome && !/edge/i.test(navigator.userAgent) || /firefox/i.test(navigator.userAgent) ? ["%c[%s::%s]:", "font-weight: bold; background-color:#EEEE00;"] : ["[%s::%s]:"], Polymer.Base.chainObject = function (e, t) {
			return e && t && e !== t && (Object.__proto__ || (e = Polymer.Base.extend(Object.create(t), e)), e.__proto__ = t), e
		}, Polymer.Base = Polymer.Base.chainObject(Polymer.Base, HTMLElement.prototype), Polymer.BaseDescriptors = {}, o.disableUpgradeEnabled) {
			e = function (e, t) {
				this.__data__[e] = t
			};
			var n = Polymer.Base.attributeChangedCallback;
			Polymer.Base.attributeChangedCallback = function (e, t, i) {
				this.__hasInitialized || "disable-upgrade" !== e || (this.__hasInitialized = !0, this._propertySetter = Polymer.Bind._modelApi._propertySetter, this._configValue = Polymer.Base._configValue, this.__initialize()), n.call(this, e, t, i)
			}
		}
		window.CustomElements ? Polymer.instanceof = CustomElements.instanceof : Polymer.instanceof = function (e, t) {
			return e instanceof t
		}, Polymer.isInstance = function (e) {
			return Boolean(e && e.__isPolymerInstance__)
		}, Polymer.telemetry.instanceCount = 0
	}(),
	function () {
		var i = {},
			n = {};

		function t(e, t) {
			i[e] = n[e.toLowerCase()] = t
		}

		function r(e) {
			return i[e] || n[e.toLowerCase()]
		}

		function e() {
			return document.createElement("dom-module")
		}
		e.prototype = Object.create(HTMLElement.prototype), Polymer.Base.mixin(e.prototype,
			{
				createdCallback: function () {
					this.register()
				},
				register: function (e) {
					if (e = e || this.id || this.getAttribute("name") || this.getAttribute("is")) {
						if (Polymer.Settings.strictTemplatePolicy && void 0 !== r(e)) throw t(e, null), new Error("strictTemplatePolicy: dom-module " + e + " re-registered");
						t(this.id = e, this)
					}
				},
				import: function (e, t) {
					if (e) {
						var i = r(e);
						return i || (function () {
							if (o)
								for (var e, t = document._currentScript || document.currentScript, i = (t && t.ownerDocument || document).querySelectorAll("dom-module"), n = i.length - 1; 0 <= n && (e = i[n]); n--) {
									if (e.__upgraded__) return;
									CustomElements.upgrade(e)
								}
						}(), i = r(e)), i && t && (i = i.querySelector(t)), i
					}
				}
			}), Object.defineProperty(e.prototype, "constructor",
				{
					value: e,
					configurable: !0,
					writable: !0
				});
		var o = window.CustomElements && !CustomElements.useNative;
		document.registerElement("dom-module", e)
	}(), Polymer.Base._addFeature(
		{
			_prepIs: function () {
				if (!this.is) {
					var e = (document._currentScript || document.currentScript).parentNode;
					if ("dom-module" === e.localName) {
						var t = e.id || e.getAttribute("name") || e.getAttribute("is");
						this.is = t
					}
				}
				this.is && (this.is = this.is.toLowerCase())
			}
		}), Polymer.Base._addFeature(
			{
				behaviors: [],
				_desugarBehaviors: function () {
					this.behaviors.length && (this.behaviors = this._desugarSomeBehaviors(this.behaviors))
				},
				_desugarSomeBehaviors: function (e) {
					for (var t = [], i = (e = this._flattenBehaviorsList(e)).length - 1; 0 <= i; i--) {
						var n = e[i]; - 1 === t.indexOf(n) && (this._mixinBehavior(n), t.unshift(n))
					}
					return t
				},
				_flattenBehaviorsList: function (e) {
					for (var t = [], i = 0; i < e.length; i++) {
						var n = e[i];
						n instanceof Array ? t = t.concat(this._flattenBehaviorsList(n)) : n ? t.push(n) : this._warn(this._logf("_flattenBehaviorsList", "behavior is null, check for missing or 404 import"))
					}
					return t
				},
				_mixinBehavior: function (e) {
					for (var t, i = Object.getOwnPropertyNames(e), n = e._noAccessors, r = 0; r < i.length && (t = i[r]); r++) Polymer.Base._behaviorProperties[t] || this.hasOwnProperty(t) || (n ? this[t] = e[t] : this.copyOwnProperty(t, e, this))
				},
				_prepBehaviors: function () {
					this._prepFlattenedBehaviors(this.behaviors)
				},
				_prepFlattenedBehaviors: function (e) {
					for (var t = 0, i = e.length; t < i; t++) this._prepBehavior(e[t]);
					this._prepBehavior(this)
				},
				_marshalBehaviors: function () {
					for (var e = 0; e < this.behaviors.length; e++) this._marshalBehavior(this.behaviors[e]);
					this._marshalBehavior(this)
				}
			}), Polymer.Base._behaviorProperties = {
				hostAttributes: !0,
				beforeRegister: !0,
				registered: !0,
				properties: !0,
				observers: !0,
				listeners: !0,
				created: !0,
				attached: !0,
				detached: !0,
				attributeChanged: !0,
				ready: !0,
				_noAccessors: !0
			}, Polymer.Base._addFeature(
				{
					_getExtendedPrototype: function (e) {
						return this._getExtendedNativePrototype(e)
					},
					_nativePrototypes:
						{},
					_getExtendedNativePrototype: function (e) {
						var t = this._nativePrototypes[e];
						if (!t) {
							t = Object.create(this.getNativePrototype(e));
							for (var i, n = Object.getOwnPropertyNames(Polymer.Base), r = 0; r < n.length && (i = n[r]); r++) Polymer.BaseDescriptors[i] || (t[i] = Polymer.Base[i]);
							Object.defineProperties(t, Polymer.BaseDescriptors), this._nativePrototypes[e] = t
						}
						return t
					},
					getNativePrototype: function (e) {
						return Object.getPrototypeOf(document.createElement(e))
					}
				}), Polymer.Base._addFeature(
					{
						_prepConstructor: function () {
							this._factoryArgs = this.extends ? [this.extends, this.is] : [this.is];

							function e() {
								return this._factory(arguments)
							}
							this.hasOwnProperty("extends") && (e.extends = this.extends), Object.defineProperty(this, "constructor",
								{
									value: e,
									writable: !0,
									configurable: !0
								}), e.prototype = this
						},
						_factory: function (e) {
							var t = document.createElement.apply(document, this._factoryArgs);
							return this.factoryImpl && this.factoryImpl.apply(t, e), t
						}
					}), Polymer.nob = Object.create(null), Polymer.Base._addFeature(
						{
							getPropertyInfo: function (e) {
								var t = this._getPropertyInfo(e, this.properties);
								if (!t)
									for (var i = 0; i < this.behaviors.length; i++)
										if (t = this._getPropertyInfo(e, this.behaviors[i].properties)) return t;
								return t || Polymer.nob
							},
							_getPropertyInfo: function (e, t) {
								var i = t && t[e];
								return "function" == typeof i && (i = t[e] = {
									type: i
								}), i && (i.defined = !0), i
							},
							_prepPropertyInfo: function () {
								this._propertyInfo = {};
								for (var e = 0; e < this.behaviors.length; e++) this._addPropertyInfo(this._propertyInfo, this.behaviors[e].properties);
								this._addPropertyInfo(this._propertyInfo, this.properties), this._addPropertyInfo(this._propertyInfo, this._propertyEffects)
							},
							_addPropertyInfo: function (e, t) {
								var i, n;
								if (t)
									for (var r in t) i = e[r], n = t[r], "_" === r[0] && !n.readOnly || (e[r] ? (i.type || (i.type = n.type), i.readOnly || (i.readOnly = n.readOnly)) : e[r] = {
										type: "function" == typeof n ? n : n.type,
										readOnly: n.readOnly,
										attribute: Polymer.CaseMap.camelToDashCase(r)
									})
							}
						}),
	function () {
		var e = {
			configurable: !0,
			writable: !0,
			enumerable: !0,
			value:
				{}
		};
		Polymer.BaseDescriptors.properties = e, Object.defineProperty(Polymer.Base, "properties", e)
	}(), Polymer.CaseMap = {
		_caseMap:
			{},
		_rx:
		{
			dashToCamel: /-[a-z]/g,
			camelToDash: /([A-Z])/g
		},
		dashToCamelCase: function (e) {
			return this._caseMap[e] || (this._caseMap[e] = e.indexOf("-") < 0 ? e : e.replace(this._rx.dashToCamel, function (e) {
				return e[1].toUpperCase()
			}))
		},
		camelToDashCase: function (e) {
			return this._caseMap[e] || (this._caseMap[e] = e.replace(this._rx.camelToDash, "-$1").toLowerCase())
		}
	}, Polymer.Base._addFeature(
		{
			_addHostAttributes: function (e) {
				this._aggregatedAttributes || (this._aggregatedAttributes = {}), e && this.mixin(this._aggregatedAttributes, e)
			},
			_marshalHostAttributes: function () {
				this._aggregatedAttributes && this._applyAttributes(this, this._aggregatedAttributes)
			},
			_applyAttributes: function (e, t) {
				for (var i in t)
					if (!this.hasAttribute(i) && "class" !== i) {
						var n = t[i];
						this.serializeValueToAttribute(n, i, this)
					}
			},
			_marshalAttributes: function () {
				this._takeAttributesToModel(this)
			},
			_takeAttributesToModel: function (e) {
				if (this.hasAttributes())
					for (var t in this._propertyInfo) {
						var i = this._propertyInfo[t];
						this.hasAttribute(i.attribute) && this._setAttributeToProperty(e, i.attribute, t, i)
					}
			},
			_setAttributeToProperty: function (e, t, i, n) {
				if (!this._serializing && (i = i || Polymer.CaseMap.dashToCamelCase(t), (n = n || this._propertyInfo && this._propertyInfo[i]) && !n.readOnly)) {
					var r = this.getAttribute(t);
					e[i] = this.deserialize(r, n.type)
				}
			},
			_serializing: !1,
			reflectPropertyToAttribute: function (e, t, i) {
				this._serializing = !0, i = void 0 === i ? this[e] : i, this.serializeValueToAttribute(i, t || Polymer.CaseMap.camelToDashCase(e)), this._serializing = !1
			},
			serializeValueToAttribute: function (e, t, i) {
				var n = this.serialize(e);
				i = i || this, void 0 === n ? i.removeAttribute(t) : i.setAttribute(t, n)
			},
			deserialize: function (t, e) {
				switch (e) {
					case Number:
						t = Number(t);
						break;
					case Boolean:
						t = null != t;
						break;
					case Object:
						try {
							t = JSON.parse(t)
						}
						catch (e) { }
						break;
					case Array:
						try {
							t = JSON.parse(t)
						}
						catch (e) {
							t = null, console.warn("Polymer::Attributes: couldn`t decode Array as JSON")
						}
						break;
					case Date:
						t = new Date(t);
						break;
					case String:
				}
				return t
			},
			serialize: function (e) {
				switch (typeof e) {
					case "boolean":
						return e ? "" : void 0;
					case "object":
						if (e instanceof Date) return e.toString();
						if (e) try {
								return JSON.stringify(e)
							}
							catch (e) {
								return ""
							}
					default:
						return null != e ? e : void 0
				}
			}
		}), Polymer.version = "1.12.0", Polymer.Base._addFeature(
			{
				_registerFeatures: function () {
					this._prepIs(), this._prepBehaviors(), this._prepConstructor(), this._prepPropertyInfo()
				},
				_prepBehavior: function (e) {
					this._addHostAttributes(e.hostAttributes)
				},
				_marshalBehavior: function (e) { },
				_initFeatures: function () {
					this._marshalHostAttributes(), this._marshalBehaviors()
				}
			}),
	function () {
		function l(e, r) {
			return e.replace(t, function (e, t, i, n) {
				return t + "'" + d(i.replace(/["']/g, ""), r) + "'" + n
			})
		}

		function d(e, t) {
			if (e && r.test(e)) return e;
			var i = function (e) {
				return e.body.__urlResolver || (e.body.__urlResolver = e.createElement("a"))
			}(t);
			return i.href = e, i.href || e
		}
		var i, n;

		function e(e) {
			return e.substring(0, e.lastIndexOf("/") + 1)
		}
		var t = /(url\()([^)]*)(\))/g,
			h = {
				"*": ["href", "src", "style", "url"],
				form: ["action"]
			},
			r = /(^\/)|(^#)|(^[\w-\d]*:)/,
			u = /\{\{|\[\[/;
		Polymer.ResolveUrl = {
			resolveCss: l,
			resolveAttrs: function (e, t) {
				for (var i in h)
					for (var n, r, o, s = h[i], a = 0, c = s.length; a < c && (n = s[a]); a++) "*" !== i && e.localName !== i || (o = (r = e.attributes[n]) && r.value) && o.search(u) < 0 && (r.value = "style" === n ? l(o, t) : d(o, t))
			},
			resolveUrl: function (e, t) {
				return i || (i = document.implementation.createHTMLDocument("temp"), n = i.createElement("base"), i.head.appendChild(n)), n.href = t, d(e, i)
			},
			pathFromUrl: e
		}, Polymer.rootPath = Polymer.Settings.rootPath || e(document.baseURI || window.location.href)
	}(), Polymer.Base._addFeature(
		{
			_prepTemplate: function () {
				var e;
				if (void 0 === this._template) {
					var t = (e = Polymer.DomModule.import(this.is)) && e.querySelector("template");
					if (Polymer.Settings.strictTemplatePolicy && !t) throw new Error("strictTemplatePolicy: expecting dom-module or null _template for " + this.is);
					this._template = t
				}
				if (e) {
					var i = e.getAttribute("assetpath") || "",
						n = Polymer.ResolveUrl.resolveUrl(i, e.ownerDocument.baseURI);
					this._importPath = Polymer.ResolveUrl.pathFromUrl(n)
				}
				else this._importPath = "";
				this._template && this._template.hasAttribute("is") && this._warn(this._logf("_prepTemplate", "top-level Polymer template must not be a type-extension, found", this._template, "Move inside simple <template>.")), this._template && !this._template.content && window.HTMLTemplateElement && HTMLTemplateElement.decorate && HTMLTemplateElement.decorate(this._template)
			},
			_stampTemplate: function () {
				this._template && (this.root = this.instanceTemplate(this._template))
			},
			instanceTemplate: function (e) {
				return document.importNode(e._content || e.content, !0)
			}
		}),
	function () {
		var e = Polymer.Base.attachedCallback,
			t = Polymer.Base.detachedCallback;
		Polymer.Base._addFeature(
			{
				_hostStack: [],
				ready: function () { },
				_registerHost: function (e) {
					this.dataHost = e = e || Polymer.Base._hostStack[Polymer.Base._hostStack.length - 1], e && e._clients && e._clients.push(this), this._clients = null, this._clientsReadied = !1
				},
				_beginHosting: function () {
					Polymer.Base._hostStack.push(this), this._clients || (this._clients = [])
				},
				_endHosting: function () {
					Polymer.Base._hostStack.pop()
				},
				_tryReady: function () {
					this._readied = !1, this._canReady() && this._ready()
				},
				_canReady: function () {
					return !this.dataHost || this.dataHost._clientsReadied
				},
				_ready: function () {
					this._beforeClientsReady(), this._template && (this._setupRoot(), this._readyClients()), this._clientsReadied = !0, this._clients = null, this._afterClientsReady(), this._readySelf()
				},
				_readyClients: function () {
					this._beginDistribute();
					var e = this._clients;
					if (e)
						for (var t, i = 0, n = e.length; i < n && (t = e[i]); i++) t._ready();
					this._finishDistribute()
				},
				_readySelf: function () {
					for (var e, t = 0; t < this.behaviors.length; t++)(e = this.behaviors[t]).ready && e.ready.call(this);
					this.ready && this.ready(), this._readied = !0, this._attachedPending && (this._attachedPending = !1, this.attachedCallback())
				},
				_beforeClientsReady: function () { },
				_afterClientsReady: function () { },
				_beforeAttached: function () { },
				attachedCallback: function () {
					this._readied ? (this._beforeAttached(), e.call(this)) : this._attachedPending = !0
				},
				detachedCallback: function () {
					this._readied ? t.call(this) : this._attachedPending = !1
				}
			})
	}(), Polymer.ArraySplice = function () {
		function m(e, t, i) {
			return {
				index: e,
				removed: t,
				addedCount: i
			}
		}

		function e() { }
		return e.prototype = {
			calcEditDistances: function (e, t, i, n, r, o) {
				for (var s = o - r + 1, a = i - t + 1, c = new Array(s), l = 0; l < s; l++) c[l] = new Array(a), c[l][0] = l;
				for (var d = 0; d < a; d++) c[0][d] = d;
				for (l = 1; l < s; l++)
					for (d = 1; d < a; d++)
						if (this.equals(e[t + d - 1], n[r + l - 1])) c[l][d] = c[l - 1][d - 1];
						else {
							var h = c[l - 1][d] + 1,
								u = c[l][d - 1] + 1;
							c[l][d] = h < u ? h : u
						} return c
			},
			spliceOperationsFromEditDistances: function (e) {
				for (var t = e.length - 1, i = e[0].length - 1, n = e[t][i], r = []; 0 < t || 0 < i;)
					if (0 != t)
						if (0 != i) {
							var o, s = e[t - 1][i - 1],
								a = e[t - 1][i],
								c = e[t][i - 1];
							(o = a < c ? a < s ? a : s : c < s ? c : s) == s ? (s == n ? r.push(0) : (r.push(1), n = s), t--, i--) : n = o == a ? (r.push(3), t--, a) : (r.push(2), i--, c)
						}
						else r.push(3), t--;
					else r.push(2), i--;
				return r.reverse(), r
			},
			calcSplices: function (e, t, i, n, r, o) {
				var s = 0,
					a = 0,
					c = Math.min(i - t, o - r);
				if (0 == t && 0 == r && (s = this.sharedPrefix(e, n, c)), i == e.length && o == n.length && (a = this.sharedSuffix(e, n, c - s)), r += s, o -= a, (i -= a) - (t += s) == 0 && o - r == 0) return [];
				if (t == i) {
					for (var l = m(t, [], 0); r < o;) l.removed.push(n[r++]);
					return [l]
				}
				if (r == o) return [m(t, [], i - t)];
				var d = this.spliceOperationsFromEditDistances(this.calcEditDistances(e, t, i, n, r, o));
				l = void 0;
				for (var h = [], u = t, p = r, f = 0; f < d.length; f++) switch (d[f]) {
						case 0:
							l && (h.push(l), l = void 0), u++, p++;
							break;
						case 1:
							(l = l || m(u, [], 0)).addedCount++, u++, l.removed.push(n[p]), p++;
							break;
						case 2:
							(l = l || m(u, [], 0)).addedCount++, u++;
							break;
						case 3:
							(l = l || m(u, [], 0)).removed.push(n[p]), p++
					}
				return l && h.push(l), h
			},
			sharedPrefix: function (e, t, i) {
				for (var n = 0; n < i; n++)
					if (!this.equals(e[n], t[n])) return n;
				return i
			},
			sharedSuffix: function (e, t, i) {
				for (var n = e.length, r = t.length, o = 0; o < i && this.equals(e[--n], t[--r]);) o++;
				return o
			},
			calculateSplices: function (e, t) {
				return this.calcSplices(e, 0, e.length, t, 0, t.length)
			},
			equals: function (e, t) {
				return e === t
			}
		}, new e
	}(), Polymer.domInnerHTML = function () {
		var l = /[&\u00A0"]/g,
			d = /[&\u00A0<>]/g;

		function h(e) {
			switch (e) {
				case "&":
					return "&amp;";
				case "<":
					return "&lt;";
				case ">":
					return "&gt;";
				case '"':
					return "&quot;";
				case " ":
					return "&nbsp;"
			}
		}

		function e(e) {
			for (var t = {}, i = 0; i < e.length; i++) t[e[i]] = !0;
			return t
		}
		var u = e(["area", "base", "br", "col", "command", "embed", "hr", "img", "input", "keygen", "link", "meta", "param", "source", "track", "wbr"]),
			p = e(["style", "script", "xmp", "iframe", "noembed", "noframes", "plaintext", "noscript"]);

		function a(e, t, i) {
			switch (e.nodeType) {
				case Node.ELEMENT_NODE:
					for (var n, r = e.localName, o = "<" + r, s = e.attributes, a = 0; n = s[a]; a++) o += " " + n.name + '="' + n.value.replace(l, h) + '"';
					return o += ">", u[r] ? o : o + f(e, i) + "</" + r + ">";
				case Node.TEXT_NODE:
					var c = e.data;
					return t && p[t.localName] ? c : function (e) {
						return e.replace(d, h)
					}(c);
				case Node.COMMENT_NODE:
					return "<!--" + e.data + "-->";
				default:
					throw console.error(e), new Error("not implemented")
			}
		}

		function f(e, t) {
			e instanceof HTMLTemplateElement && (e = e.content);
			for (var i, n = "", r = Polymer.dom(e).childNodes, o = 0, s = r.length; o < s && (i = r[o]); o++) n += a(i, e, t);
			return n
		}
		return {
			getInnerHTML: f
		}
	}(),
	function () {
		"use strict";
		var n = Element.prototype.insertBefore,
			i = Element.prototype.appendChild,
			r = Element.prototype.removeChild;
		Polymer.TreeApi = {
			arrayCopyChildNodes: function (e) {
				for (var t = [], i = 0, n = e.firstChild; n; n = n.nextSibling) t[i++] = n;
				return t
			},
			arrayCopyChildren: function (e) {
				for (var t = [], i = 0, n = e.firstElementChild; n; n = n.nextElementSibling) t[i++] = n;
				return t
			},
			arrayCopy: function (e) {
				for (var t = e.length, i = new Array(t), n = 0; n < t; n++) i[n] = e[n];
				return i
			}
		}, Polymer.TreeApi.Logical = {
			hasParentNode: function (e) {
				return Boolean(e.__dom && e.__dom.parentNode)
			},
			hasChildNodes: function (e) {
				return Boolean(e.__dom && void 0 !== e.__dom.childNodes)
			},
			getChildNodes: function (e) {
				return this.hasChildNodes(e) ? this._getChildNodes(e) : e.childNodes
			},
			_getChildNodes: function (e) {
				if (!e.__dom.childNodes) {
					e.__dom.childNodes = [];
					for (var t = e.__dom.firstChild; t; t = t.__dom.nextSibling) e.__dom.childNodes.push(t)
				}
				return e.__dom.childNodes
			},
			getParentNode: function (e) {
				return e.__dom && void 0 !== e.__dom.parentNode ? e.__dom.parentNode : e.parentNode
			},
			getFirstChild: function (e) {
				return e.__dom && void 0 !== e.__dom.firstChild ? e.__dom.firstChild : e.firstChild
			},
			getLastChild: function (e) {
				return e.__dom && void 0 !== e.__dom.lastChild ? e.__dom.lastChild : e.lastChild
			},
			getNextSibling: function (e) {
				return e.__dom && void 0 !== e.__dom.nextSibling ? e.__dom.nextSibling : e.nextSibling
			},
			getPreviousSibling: function (e) {
				return e.__dom && void 0 !== e.__dom.previousSibling ? e.__dom.previousSibling : e.previousSibling
			},
			getFirstElementChild: function (e) {
				return e.__dom && void 0 !== e.__dom.firstChild ? this._getFirstElementChild(e) : e.firstElementChild
			},
			_getFirstElementChild: function (e) {
				for (var t = e.__dom.firstChild; t && t.nodeType !== Node.ELEMENT_NODE;) t = t.__dom.nextSibling;
				return t
			},
			getLastElementChild: function (e) {
				return e.__dom && void 0 !== e.__dom.lastChild ? this._getLastElementChild(e) : e.lastElementChild
			},
			_getLastElementChild: function (e) {
				for (var t = e.__dom.lastChild; t && t.nodeType !== Node.ELEMENT_NODE;) t = t.__dom.previousSibling;
				return t
			},
			getNextElementSibling: function (e) {
				return e.__dom && void 0 !== e.__dom.nextSibling ? this._getNextElementSibling(e) : e.nextElementSibling
			},
			_getNextElementSibling: function (e) {
				for (var t = e.__dom.nextSibling; t && t.nodeType !== Node.ELEMENT_NODE;) t = t.__dom.nextSibling;
				return t
			},
			getPreviousElementSibling: function (e) {
				return e.__dom && void 0 !== e.__dom.previousSibling ? this._getPreviousElementSibling(e) : e.previousElementSibling
			},
			_getPreviousElementSibling: function (e) {
				for (var t = e.__dom.previousSibling; t && t.nodeType !== Node.ELEMENT_NODE;) t = t.__dom.previousSibling;
				return t
			},
			saveChildNodes: function (e) {
				if (!this.hasChildNodes(e)) {
					e.__dom = e.__dom ||
						{}, e.__dom.firstChild = e.firstChild, e.__dom.lastChild = e.lastChild, e.__dom.childNodes = [];
					for (var t = e.firstChild; t; t = t.nextSibling) t.__dom = t.__dom ||
						{}, (t.__dom.parentNode = e).__dom.childNodes.push(t), t.__dom.nextSibling = t.nextSibling, t.__dom.previousSibling = t.previousSibling
				}
			},
			recordInsertBefore: function (e, t, i) {
				if (t.__dom.childNodes = null, e.nodeType === Node.DOCUMENT_FRAGMENT_NODE)
					for (var n = e.firstChild; n; n = n.nextSibling) this._linkNode(n, t, i);
				else this._linkNode(e, t, i)
			},
			_linkNode: function (e, t, i) {
				e.__dom = e.__dom ||
					{}, t.__dom = t.__dom ||
					{}, i && (i.__dom = i.__dom ||
						{}), e.__dom.previousSibling = i ? i.__dom.previousSibling : t.__dom.lastChild, e.__dom.previousSibling && (e.__dom.previousSibling.__dom.nextSibling = e), e.__dom.nextSibling = i || null, e.__dom.nextSibling && (e.__dom.nextSibling.__dom.previousSibling = e), e.__dom.parentNode = t, i ? i === t.__dom.firstChild && (t.__dom.firstChild = e) : (t.__dom.lastChild = e, t.__dom.firstChild || (t.__dom.firstChild = e)), t.__dom.childNodes = null
			},
			recordRemoveChild: function (e, t) {
				e.__dom = e.__dom ||
					{}, t.__dom = t.__dom ||
					{}, e === t.__dom.firstChild && (t.__dom.firstChild = e.__dom.nextSibling), e === t.__dom.lastChild && (t.__dom.lastChild = e.__dom.previousSibling);
				var i = e.__dom.previousSibling,
					n = e.__dom.nextSibling;
				i && (i.__dom.nextSibling = n), n && (n.__dom.previousSibling = i), e.__dom.parentNode = e.__dom.previousSibling = e.__dom.nextSibling = void 0, t.__dom.childNodes = null
			}
		}, Polymer.TreeApi.Composed = {
			getChildNodes: function (e) {
				return Polymer.TreeApi.arrayCopyChildNodes(e)
			},
			getParentNode: function (e) {
				return e.parentNode
			},
			clearChildNodes: function (e) {
				e.textContent = ""
			},
			insertBefore: function (e, t, i) {
				return n.call(e, t, i || null)
			},
			appendChild: function (e, t) {
				return i.call(e, t)
			},
			removeChild: function (e, t) {
				return r.call(e, t)
			}
		}
	}(), Polymer.DomApi = function () {
		"use strict";
		var e = Polymer.Settings,
			o = Polymer.TreeApi,
			s = function (e) {
				this.node = t ? s.wrap(e) : e
			},
			t = e.hasShadow && !e.nativeShadow;
		s.wrap = window.wrap ? window.wrap : function (e) {
			return e
		}, s.prototype = {
			flush: function () {
				Polymer.dom.flush()
			},
			deepContains: function (e) {
				if (this.node.contains(e)) return !0;
				for (var t = e, i = e.ownerDocument; t && t !== i && t !== this.node;) t = Polymer.dom(t).parentNode || t.host;
				return t === this.node
			},
			queryDistributedElements: function (e) {
				for (var t, i = this.getEffectiveChildNodes(), n = [], r = 0, o = i.length; r < o && (t = i[r]); r++) t.nodeType === Node.ELEMENT_NODE && s.matchesSelector.call(t, e) && n.push(t);
				return n
			},
			getEffectiveChildNodes: function () {
				for (var e, t = [], i = this.childNodes, n = 0, r = i.length; n < r && (e = i[n]); n++)
					if (e.localName === a)
						for (var o = c(e).getDistributedNodes(), s = 0; s < o.length; s++) t.push(o[s]);
					else t.push(e);
				return t
			},
			observeNodes: function (e) {
				if (e) return this.observer || (this.observer = this.node.localName === a ? new s.DistributedNodesObserver(this) : new s.EffectiveNodesObserver(this)), this.observer.addListener(e)
			},
			unobserveNodes: function (e) {
				this.observer && this.observer.removeListener(e)
			},
			notifyObserver: function () {
				this.observer && this.observer.notify()
			},
			_query: function (e, t, i) {
				t = t || this.node;
				var n = [];
				return this._queryElements(o.Logical.getChildNodes(t), e, i, n), n
			},
			_queryElements: function (e, t, i, n) {
				for (var r, o = 0, s = e.length; o < s && (r = e[o]); o++)
					if (r.nodeType === Node.ELEMENT_NODE && this._queryElement(r, t, i, n)) return !0
			},
			_queryElement: function (e, t, i, n) {
				var r = t(e);
				if (r && n.push(e), i && i(r)) return r;
				this._queryElements(o.Logical.getChildNodes(e), t, i, n)
			}
		};
		var a = s.CONTENT = "content",
			c = s.factory = function (e) {
				return (e = e || document).__domApi || (e.__domApi = new s.ctor(e)), e.__domApi
			};
		s.hasApi = function (e) {
			return Boolean(e.__domApi)
		}, s.ctor = s, Polymer.dom = function (e, t) {
			return e instanceof Event ? Polymer.EventApi.factory(e) : s.factory(e, t)
		};
		var i = Element.prototype;
		return s.matchesSelector = i.matches || i.matchesSelector || i.mozMatchesSelector || i.msMatchesSelector || i.oMatchesSelector || i.webkitMatchesSelector, s
	}(),
	function () {
		"use strict";
		var e = Polymer.Settings,
			r = Polymer.DomApi,
			d = r.factory,
			h = Polymer.TreeApi,
			t = Polymer.domInnerHTML.getInnerHTML,
			c = r.CONTENT;
		if (!e.useShadow) {
			var s = Element.prototype.cloneNode,
				l = Document.prototype.importNode;
			Polymer.Base.mixin(r.prototype,
				{
					_lazyDistribute: function (e) {
						e.shadyRoot && e.shadyRoot._distributionClean && (e.shadyRoot._distributionClean = !1, Polymer.dom.addDebouncer(e.debounce("_distribute", e._distributeContent)))
					},
					appendChild: function (e) {
						return this.insertBefore(e)
					},
					insertBefore: function (e, t) {
						if (t && h.Logical.getParentNode(t) !== this.node) throw Error("The ref_node to be inserted before is not a child of this node");
						if (e.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) {
							var i = h.Logical.getParentNode(e);
							i ? (r.hasApi(i) && d(i).notifyObserver(), this._removeNode(e)) : this._removeOwnerShadyRoot(e)
						}
						if (!this._addNode(e, t)) {
							t = t && (t.localName === c ? this._firstComposedNode(t) : t);
							var n = this.node._isShadyRoot ? this.node.host : this.node;
							t ? h.Composed.insertBefore(n, e, t) : h.Composed.appendChild(n, e)
						}
						return this.notifyObserver(), e
					},
					_addNode: function (e, t) {
						var i = this.getOwnerRoot();
						if (i) {
							var n = this._maybeAddInsertionPoint(e, this.node);
							i._invalidInsertionPoints || (i._invalidInsertionPoints = n), this._addNodeToHost(i.host, e)
						}
						h.Logical.hasChildNodes(this.node) && h.Logical.recordInsertBefore(e, this.node, t);
						var r = this._maybeDistribute(e) || this.node.shadyRoot;
						if (r)
							if (e.nodeType === Node.DOCUMENT_FRAGMENT_NODE)
								for (; e.firstChild;) h.Composed.removeChild(e, e.firstChild);
							else {
								var o = h.Composed.getParentNode(e);
								o && h.Composed.removeChild(o, e)
							} return r
					},
					removeChild: function (e) {
						if (h.Logical.getParentNode(e) !== this.node) throw Error("The node to be removed is not a child of this node: " + e);
						if (!this._removeNode(e)) {
							var t = this.node._isShadyRoot ? this.node.host : this.node;
							t === h.Composed.getParentNode(e) && h.Composed.removeChild(t, e)
						}
						return this.notifyObserver(), e
					},
					_removeNode: function (e) {
						var t, i = h.Logical.hasParentNode(e) && h.Logical.getParentNode(e),
							n = this._ownerShadyRootForNode(e);
						return i && (t = d(e)._maybeDistributeParent(), h.Logical.recordRemoveChild(e, i), n && this._removeDistributedChildren(n, e) && (n._invalidInsertionPoints = !0, this._lazyDistribute(n.host))), this._removeOwnerShadyRoot(e), n && this._removeNodeFromHost(n.host, e), t
					},
					replaceChild: function (e, t) {
						return this.insertBefore(e, t), this.removeChild(t), e
					},
					_hasCachedOwnerRoot: function (e) {
						return Boolean(void 0 !== e._ownerShadyRoot)
					},
					getOwnerRoot: function () {
						return this._ownerShadyRootForNode(this.node)
					},
					_ownerShadyRootForNode: function (e) {
						if (e) {
							var t = e._ownerShadyRoot;
							if (void 0 === t) {
								if (e._isShadyRoot) t = e;
								else {
									var i = h.Logical.getParentNode(e);
									t = i ? i._isShadyRoot ? i : this._ownerShadyRootForNode(i) : null
								} (t || document.documentElement.contains(e)) && (e._ownerShadyRoot = t)
							}
							return t
						}
					},
					_maybeDistribute: function (e) {
						var t = e.nodeType === Node.DOCUMENT_FRAGMENT_NODE && !e.__noContent && d(e).querySelector(c),
							i = t && h.Logical.getParentNode(t).nodeType !== Node.DOCUMENT_FRAGMENT_NODE,
							n = t || e.localName === c;
						if (n) {
							var r = this.getOwnerRoot();
							r && this._lazyDistribute(r.host)
						}
						var o = this._nodeNeedsDistribution(this.node);
						return o && this._lazyDistribute(this.node), o || n && !i
					},
					_maybeAddInsertionPoint: function (e, t) {
						var i;
						if (e.nodeType !== Node.DOCUMENT_FRAGMENT_NODE || e.__noContent) e.localName === c && (h.Logical.saveChildNodes(t), h.Logical.saveChildNodes(e), i = !0);
						else
							for (var n, r, o, s = d(e).querySelectorAll(c), a = 0; a < s.length && (n = s[a]); a++)(r = h.Logical.getParentNode(n)) === e && (r = t), o = this._maybeAddInsertionPoint(n, r), i = i || o;
						return i
					},
					_updateInsertionPoints: function (e) {
						for (var t, i = e.shadyRoot._insertionPoints = d(e.shadyRoot).querySelectorAll(c), n = 0; n < i.length; n++) t = i[n], h.Logical.saveChildNodes(t), h.Logical.saveChildNodes(h.Logical.getParentNode(t))
					},
					_nodeNeedsDistribution: function (e) {
						return e && e.shadyRoot && r.hasInsertionPoint(e.shadyRoot)
					},
					_addNodeToHost: function (e, t) {
						e._elementAdd && e._elementAdd(t)
					},
					_removeNodeFromHost: function (e, t) {
						e._elementRemove && e._elementRemove(t)
					},
					_removeDistributedChildren: function (e, t) {
						for (var i, n = e._insertionPoints, r = 0; r < n.length; r++) {
							var o = n[r];
							if (this._contains(t, o))
								for (var s = d(o).getDistributedNodes(), a = 0; a < s.length; a++) {
									i = !0;
									var c = s[a],
										l = h.Composed.getParentNode(c);
									l && h.Composed.removeChild(l, c)
								}
						}
						return i
					},
					_contains: function (e, t) {
						for (; t;) {
							if (t == e) return !0;
							t = h.Logical.getParentNode(t)
						}
					},
					_removeOwnerShadyRoot: function (e) {
						if (this._hasCachedOwnerRoot(e))
							for (var t, i = h.Logical.getChildNodes(e), n = 0, r = i.length; n < r && (t = i[n]); n++) this._removeOwnerShadyRoot(t);
						e._ownerShadyRoot = void 0
					},
					_firstComposedNode: function (e) {
						for (var t, i, n = d(e).getDistributedNodes(), r = 0, o = n.length; r < o && (t = n[r]); r++)
							if ((i = d(t).getDestinationInsertionPoints())[i.length - 1] === e) return t
					},
					querySelector: function (t) {
						return this._query(function (e) {
							return r.matchesSelector.call(e, t)
						}, this.node, function (e) {
							return Boolean(e)
						})[0] || null
					},
					querySelectorAll: function (t) {
						return this._query(function (e) {
							return r.matchesSelector.call(e, t)
						}, this.node)
					},
					getDestinationInsertionPoints: function () {
						return this.node._destinationInsertionPoints || []
					},
					getDistributedNodes: function () {
						return this.node._distributedNodes || []
					},
					_clear: function () {
						for (; this.childNodes.length;) this.removeChild(this.childNodes[0])
					},
					setAttribute: function (e, t) {
						this.node.setAttribute(e, t), this._maybeDistributeForAttributeChange(this.node, e)
					},
					removeAttribute: function (e) {
						this.node.removeAttribute(e), this._maybeDistributeForAttributeChange(this.node, e)
					},
					_maybeDistributeForAttributeChange: function (e, t) {
						if ("select" === t && "content" === e.localName) {
							var i = this.getOwnerRoot();
							if (i && this._nodeNeedsDistribution(i.host)) return void this._lazyDistribute(i.host)
						}
						this._maybeDistributeParent()
					},
					_maybeDistributeParent: function () {
						if (this._nodeNeedsDistribution(this.parentNode)) return this._lazyDistribute(this.parentNode), !0
					},
					cloneNode: function (e) {
						var t = s.call(this.node, !1);
						if (e)
							for (var i, n = this.childNodes, r = d(t), o = 0; o < n.length; o++) i = d(n[o]).cloneNode(!0), r.appendChild(i);
						return t
					},
					importNode: function (e, t) {
						var i = this.node instanceof Document ? this.node : this.node.ownerDocument,
							n = l.call(i, e, !1);
						if (t)
							for (var r, o = h.Logical.getChildNodes(e), s = d(n), a = 0; a < o.length; a++) r = d(i).importNode(o[a], !0), s.appendChild(r);
						return n
					},
					_getComposedInnerHTML: function () {
						return t(this.node, !0)
					}
				}), Object.defineProperties(r.prototype,
					{
						activeElement:
						{
							get: function () {
								var e = document.activeElement;
								if (!e) return null;
								var t = !!this.node._isShadyRoot;
								if (this.node !== document) {
									if (!t) return null;
									if (this.node.host === e || !this.node.host.contains(e)) return null
								}
								for (var i = d(e).getOwnerRoot(); i && i !== this.node;) e = i.host, i = d(e).getOwnerRoot();
								return this.node === document ? i ? null : e : i === this.node ? e : null
							},
							configurable: !0
						},
						childNodes:
						{
							get: function () {
								var e = h.Logical.getChildNodes(this.node);
								return Array.isArray(e) ? e : h.arrayCopyChildNodes(this.node)
							},
							configurable: !0
						},
						children:
						{
							get: function () {
								return h.Logical.hasChildNodes(this.node) ? Array.prototype.filter.call(this.childNodes, function (e) {
									return e.nodeType === Node.ELEMENT_NODE
								}) : h.arrayCopyChildren(this.node)
							},
							configurable: !0
						},
						parentNode:
						{
							get: function () {
								return h.Logical.getParentNode(this.node)
							},
							configurable: !0
						},
						firstChild:
						{
							get: function () {
								return h.Logical.getFirstChild(this.node)
							},
							configurable: !0
						},
						lastChild:
						{
							get: function () {
								return h.Logical.getLastChild(this.node)
							},
							configurable: !0
						},
						nextSibling:
						{
							get: function () {
								return h.Logical.getNextSibling(this.node)
							},
							configurable: !0
						},
						previousSibling:
						{
							get: function () {
								return h.Logical.getPreviousSibling(this.node)
							},
							configurable: !0
						},
						firstElementChild:
						{
							get: function () {
								return h.Logical.getFirstElementChild(this.node)
							},
							configurable: !0
						},
						lastElementChild:
						{
							get: function () {
								return h.Logical.getLastElementChild(this.node)
							},
							configurable: !0
						},
						nextElementSibling:
						{
							get: function () {
								return h.Logical.getNextElementSibling(this.node)
							},
							configurable: !0
						},
						previousElementSibling:
						{
							get: function () {
								return h.Logical.getPreviousElementSibling(this.node)
							},
							configurable: !0
						},
						textContent:
						{
							get: function () {
								var e = this.node.nodeType;
								if (e === Node.TEXT_NODE || e === Node.COMMENT_NODE) return this.node.textContent;
								for (var t, i = [], n = 0, r = this.childNodes; t = r[n]; n++) t.nodeType !== Node.COMMENT_NODE && i.push(t.textContent);
								return i.join("")
							},
							set: function (e) {
								var t = this.node.nodeType;
								t === Node.TEXT_NODE || t === Node.COMMENT_NODE ? this.node.textContent = e : (this._clear(), e && this.appendChild(document.createTextNode(e)))
							},
							configurable: !0
						},
						innerHTML:
						{
							get: function () {
								var e = this.node.nodeType;
								return e === Node.TEXT_NODE || e === Node.COMMENT_NODE ? null : t(this.node)
							},
							set: function (e) {
								var t = this.node.nodeType;
								if (t !== Node.TEXT_NODE || t !== Node.COMMENT_NODE) {
									this._clear();
									var i = document.createElement("div");
									i.innerHTML = e;
									for (var n = h.arrayCopyChildNodes(i), r = 0; r < n.length; r++) this.appendChild(n[r])
								}
							},
							configurable: !0
						}
					}), r.hasInsertionPoint = function (e) {
						return Boolean(e && e._insertionPoints.length)
					}
		}
	}(),
	function () {
		"use strict";
		var e = Polymer.Settings,
			t = Polymer.TreeApi,
			i = Polymer.DomApi;
		if (e.useShadow) {
			Polymer.Base.mixin(i.prototype,
				{
					querySelectorAll: function (e) {
						return t.arrayCopy(this.node.querySelectorAll(e))
					},
					getOwnerRoot: function () {
						for (var e = this.node; e;) {
							if (e.nodeType === Node.DOCUMENT_FRAGMENT_NODE && e.host) return e;
							e = e.parentNode
						}
					},
					importNode: function (e, t) {
						return (this.node instanceof Document ? this.node : this.node.ownerDocument).importNode(e, t)
					},
					getDestinationInsertionPoints: function () {
						var e = this.node.getDestinationInsertionPoints && this.node.getDestinationInsertionPoints();
						return e ? t.arrayCopy(e) : []
					},
					getDistributedNodes: function () {
						var e = this.node.getDistributedNodes && this.node.getDistributedNodes();
						return e ? t.arrayCopy(e) : []
					}
				}), Object.defineProperties(i.prototype,
					{
						activeElement:
						{
							get: function () {
								var e = i.wrap(this.node),
									t = e.activeElement;
								return e.contains(t) ? t : null
							},
							configurable: !0
						},
						childNodes:
						{
							get: function () {
								return t.arrayCopyChildNodes(this.node)
							},
							configurable: !0
						},
						children:
						{
							get: function () {
								return t.arrayCopyChildren(this.node)
							},
							configurable: !0
						},
						textContent:
						{
							get: function () {
								return this.node.textContent
							},
							set: function (e) {
								return this.node.textContent = e
							},
							configurable: !0
						},
						innerHTML:
						{
							get: function () {
								return this.node.innerHTML
							},
							set: function (e) {
								return this.node.innerHTML = e
							},
							configurable: !0
						}
					});
			var n = function (e) {
				i.prototype[e] = function () {
					return this.node[e].apply(this.node, arguments)
				}
			};
			! function (e) {
				for (var t = 0; t < e.length; t++) n(e[t])
			}(["cloneNode", "appendChild", "insertBefore", "removeChild", "replaceChild", "setAttribute", "removeAttribute", "querySelector"]);
			var r = function (e) {
				Object.defineProperty(i.prototype, e,
					{
						get: function () {
							return this.node[e]
						},
						configurable: !0
					})
			};
			! function (e) {
				for (var t = 0; t < e.length; t++) r(e[t])
			}(["parentNode", "firstChild", "lastChild", "nextSibling", "previousSibling", "firstElementChild", "lastElementChild", "nextElementSibling", "previousElementSibling"])
		}
	}(), Polymer.Base.mixin(Polymer.dom,
		{
			_flushGuard: 0,
			_FLUSH_MAX: 100,
			_needsTakeRecords: !Polymer.Settings.useNativeCustomElements,
			_debouncers: [],
			_staticFlushList: [],
			_finishDebouncer: null,
			flush: function () {
				for (this._flushGuard = 0, this._prepareFlush(); this._debouncers.length && this._flushGuard < this._FLUSH_MAX;) {
					for (; this._debouncers.length;) this._debouncers.shift().complete();
					this._finishDebouncer && this._finishDebouncer.complete(), this._prepareFlush(), this._flushGuard++
				}
				this._flushGuard >= this._FLUSH_MAX && console.warn("Polymer.dom.flush aborted. Flush may not be complete.")
			},
			_prepareFlush: function () {
				this._needsTakeRecords && CustomElements.takeRecords();
				for (var e = 0; e < this._staticFlushList.length; e++) this._staticFlushList[e]()
			},
			addStaticFlush: function (e) {
				this._staticFlushList.push(e)
			},
			removeStaticFlush: function (e) {
				var t = this._staticFlushList.indexOf(e);
				0 <= t && this._staticFlushList.splice(t, 1)
			},
			addDebouncer: function (e) {
				this._debouncers.push(e), this._finishDebouncer = Polymer.Debounce(this._finishDebouncer, this._finishFlush)
			},
			_finishFlush: function () {
				Polymer.dom._debouncers = []
			}
		}), Polymer.EventApi = function () {
			"use strict";
			var t = Polymer.DomApi.ctor,
				e = Polymer.Settings;
			t.Event = function (e) {
				this.event = e
			}, e.useShadow ? t.Event.prototype = {
				get rootTarget() {
					return this.event.path[0]
				},
				get localTarget() {
					return this.event.target
				},
				get path() {
					var e = this.event.path;
					return Array.isArray(e) || (e = Array.prototype.slice.call(e)), e
				}
			} : t.Event.prototype = {
				get rootTarget() {
					return this.event.target
				},
				get localTarget() {
					for (var e = this.event.currentTarget, t = e && Polymer.dom(e).getOwnerRoot(), i = this.path, n = 0; n < i.length; n++)
						if (Polymer.dom(i[n]).getOwnerRoot() === t) return i[n]
				},
				get path() {
					if (!this.event._path) {
						for (var e = [], t = this.rootTarget; t;) {
							e.push(t);
							var i = Polymer.dom(t).getDestinationInsertionPoints();
							if (i.length) {
								for (var n = 0; n < i.length - 1; n++) e.push(i[n]);
								t = i[i.length - 1]
							}
							else t = Polymer.dom(t).parentNode || t.host
						}
						e.push(window), this.event._path = e
					}
					return this.event._path
				}
			};
			return {
				factory: function (e) {
					return e.__eventApi || (e.__eventApi = new t.Event(e)), e.__eventApi
				}
			}
		}(),
	function () {
		"use strict";
		var e = Polymer.DomApi.ctor,
			t = Polymer.Settings.useShadow;
		Object.defineProperty(e.prototype, "classList",
			{
				get: function () {
					return this._classList || (this._classList = new e.ClassList(this)), this._classList
				},
				configurable: !0
			}), e.ClassList = function (e) {
				this.domApi = e, this.node = e.node
			}, e.ClassList.prototype = {
				add: function () {
					this.node.classList.add.apply(this.node.classList, arguments), this._distributeParent()
				},
				remove: function () {
					this.node.classList.remove.apply(this.node.classList, arguments), this._distributeParent()
				},
				toggle: function () {
					this.node.classList.toggle.apply(this.node.classList, arguments), this._distributeParent()
				},
				_distributeParent: function () {
					t || this.domApi._maybeDistributeParent()
				},
				contains: function () {
					return this.node.classList.contains.apply(this.node.classList, arguments)
				}
			}
	}(),
	function () {
		"use strict";
		var e = Polymer.DomApi.ctor,
			t = Polymer.Settings;
		if (e.EffectiveNodesObserver = function (e) {
			this.domApi = e, this.node = this.domApi.node, this._listeners = []
		}, e.EffectiveNodesObserver.prototype = {
			addListener: function (e) {
				this._isSetup || (this._setup(), this._isSetup = !0);
				var t = {
					fn: e,
					_nodes: []
				};
				return this._listeners.push(t), this._scheduleNotify(), t
			},
			removeListener: function (e) {
				var t = this._listeners.indexOf(e);
				0 <= t && (this._listeners.splice(t, 1), e._nodes = []), this._hasListeners() || (this._cleanup(), this._isSetup = !1)
			},
			_setup: function () {
				this._observeContentElements(this.domApi.childNodes)
			},
			_cleanup: function () {
				this._unobserveContentElements(this.domApi.childNodes)
			},
			_hasListeners: function () {
				return Boolean(this._listeners.length)
			},
			_scheduleNotify: function () {
				this._debouncer && this._debouncer.stop(), this._debouncer = Polymer.Debounce(this._debouncer, this._notify), this._debouncer.context = this, Polymer.dom.addDebouncer(this._debouncer)
			},
			notify: function () {
				this._hasListeners() && this._scheduleNotify()
			},
			_notify: function () {
				this._beforeCallListeners(), this._callListeners()
			},
			_beforeCallListeners: function () {
				this._updateContentElements()
			},
			_updateContentElements: function () {
				this._observeContentElements(this.domApi.childNodes)
			},
			_observeContentElements: function (e) {
				for (var t, i = 0; i < e.length && (t = e[i]); i++) this._isContent(t) && (t.__observeNodesMap = t.__observeNodesMap || new WeakMap, t.__observeNodesMap.has(this) || t.__observeNodesMap.set(this, this._observeContent(t)))
			},
			_observeContent: function (e) {
				var t = this,
					i = Polymer.dom(e).observeNodes(function () {
						t._scheduleNotify()
					});
				return i._avoidChangeCalculation = !0, i
			},
			_unobserveContentElements: function (e) {
				for (var t, i, n = 0; n < e.length && (t = e[n]); n++) this._isContent(t) && (i = t.__observeNodesMap && t.__observeNodesMap.get(this)) && (Polymer.dom(t).unobserveNodes(i), t.__observeNodesMap.delete(this))
			},
			_isContent: function (e) {
				return "content" === e.localName
			},
			_callListeners: function () {
				for (var e, t = this._listeners, i = this._getEffectiveNodes(), n = 0; n < t.length && (e = t[n]); n++) {
					var r = this._generateListenerInfo(e, i);
					(r || e._alwaysNotify) && this._callListener(e, r)
				}
			},
			_getEffectiveNodes: function () {
				return this.domApi.getEffectiveChildNodes()
			},
			_generateListenerInfo: function (e, t) {
				if (e._avoidChangeCalculation) return !0;
				for (var i, n = e._nodes, r = {
					target: this.node,
					addedNodes: [],
					removedNodes: []
				}, o = Polymer.ArraySplice.calculateSplices(t, n), s = 0; s < o.length && (i = o[s]); s++)
					for (var a, c = 0; c < i.removed.length && (a = i.removed[c]); c++) r.removedNodes.push(a);
				for (s = 0; s < o.length && (i = o[s]); s++)
					for (c = i.index; c < i.index + i.addedCount; c++) r.addedNodes.push(t[c]);
				return e._nodes = t, r.addedNodes.length || r.removedNodes.length ? r : void 0
			},
			_callListener: function (e, t) {
				return e.fn.call(this.node, t)
			},
			enableShadowAttributeTracking: function () { }
		}, t.useShadow) {
			var i = e.EffectiveNodesObserver.prototype._setup,
				n = e.EffectiveNodesObserver.prototype._cleanup;
			Polymer.Base.mixin(e.EffectiveNodesObserver.prototype,
				{
					_setup: function () {
						if (!this._observer) {
							var t = this;
							this._mutationHandler = function (e) {
								e && e.length && t._scheduleNotify()
							}, this._observer = new MutationObserver(this._mutationHandler), this._boundFlush = function () {
								t._flush()
							}, Polymer.dom.addStaticFlush(this._boundFlush), this._observer.observe(this.node,
								{
									childList: !0
								})
						}
						i.call(this)
					},
					_cleanup: function () {
						this._observer.disconnect(), this._observer = null, this._mutationHandler = null, Polymer.dom.removeStaticFlush(this._boundFlush), n.call(this)
					},
					_flush: function () {
						this._observer && this._mutationHandler(this._observer.takeRecords())
					},
					enableShadowAttributeTracking: function () {
						if (this._observer) {
							this._makeContentListenersAlwaysNotify(), this._observer.disconnect(), this._observer.observe(this.node,
								{
									childList: !0,
									attributes: !0,
									subtree: !0
								});
							var e = this.domApi.getOwnerRoot(),
								t = e && e.host;
							t && Polymer.dom(t).observer && Polymer.dom(t).observer.enableShadowAttributeTracking()
						}
					},
					_makeContentListenersAlwaysNotify: function () {
						for (var e, t = 0; t < this._listeners.length; t++)(e = this._listeners[t])._alwaysNotify = e._isContentListener
					}
				})
		}
	}(),
	function () {
		"use strict";
		var t = Polymer.DomApi.ctor,
			e = Polymer.Settings;
		t.DistributedNodesObserver = function (e) {
			t.EffectiveNodesObserver.call(this, e)
		}, t.DistributedNodesObserver.prototype = Object.create(t.EffectiveNodesObserver.prototype), Polymer.Base.mixin(t.DistributedNodesObserver.prototype,
			{
				_setup: function () { },
				_cleanup: function () { },
				_beforeCallListeners: function () { },
				_getEffectiveNodes: function () {
					return this.domApi.getDistributedNodes()
				}
			}), e.useShadow && Polymer.Base.mixin(t.DistributedNodesObserver.prototype,
				{
					_setup: function () {
						if (!this._observer) {
							var e = this.domApi.getOwnerRoot(),
								t = e && e.host;
							if (t) {
								var i = this;
								this._observer = Polymer.dom(t).observeNodes(function () {
									i._scheduleNotify()
								}), this._observer._isContentListener = !0, this._hasAttrSelect() && Polymer.dom(t).observer.enableShadowAttributeTracking()
							}
						}
					},
					_hasAttrSelect: function () {
						var e = this.node.getAttribute("select");
						return e && e.match(/[[.]+/)
					},
					_cleanup: function () {
						var e = this.domApi.getOwnerRoot(),
							t = e && e.host;
						t && Polymer.dom(t).unobserveNodes(this._observer), this._observer = null
					}
				})
	}(),
	function () {
		var n = Polymer.DomApi,
			d = Polymer.TreeApi;
		Polymer.Base._addFeature(
			{
				_prepShady: function () {
					this._useContent = this._useContent || Boolean(this._template)
				},
				_setupShady: function () {
					this.shadyRoot = null, this.__domApi || (this.__domApi = null), this.__dom || (this.__dom = null), this._ownerShadyRoot || (this._ownerShadyRoot = void 0)
				},
				_poolContent: function () {
					this._useContent && d.Logical.saveChildNodes(this)
				},
				_setupRoot: function () {
					this._useContent && (this._createLocalRoot(), this.dataHost || function (e) {
						if (r && e)
							for (var t = 0; t < e.length; t++) CustomElements.upgrade(e[t])
					}(d.Logical.getChildNodes(this)))
				},
				_createLocalRoot: function () {
					this.shadyRoot = this.root, this.shadyRoot._distributionClean = !1, this.shadyRoot._hasDistributed = !1, this.shadyRoot._isShadyRoot = !0, this.shadyRoot._dirtyRoots = [];
					var e = this.shadyRoot._insertionPoints = !this._notes || this._notes._hasContent ? this.shadyRoot.querySelectorAll("content") : [];
					d.Logical.saveChildNodes(this.shadyRoot);
					for (var t, i = 0; i < e.length; i++) t = e[i], d.Logical.saveChildNodes(t), d.Logical.saveChildNodes(t.parentNode);
					this.shadyRoot.host = this
				},
				distributeContent: function (e) {
					if (this.shadyRoot) {
						this.shadyRoot._invalidInsertionPoints = this.shadyRoot._invalidInsertionPoints || e;
						var t = function (e) {
							for (; e && i(e);) e = e.domHost;
							return e
						}(this);
						Polymer.dom(this)._lazyDistribute(t)
					}
				},
				_distributeContent: function () {
					this._useContent && !this.shadyRoot._distributionClean && (this.shadyRoot._invalidInsertionPoints && (Polymer.dom(this)._updateInsertionPoints(this), this.shadyRoot._invalidInsertionPoints = !1), this._beginDistribute(), this._distributeDirtyRoots(), this._finishDistribute())
				},
				_beginDistribute: function () {
					this._useContent && n.hasInsertionPoint(this.shadyRoot) && (this._resetDistribution(), this._distributePool(this.shadyRoot, this._collectPool()))
				},
				_distributeDirtyRoots: function () {
					for (var e, t = this.shadyRoot._dirtyRoots, i = 0, n = t.length; i < n && (e = t[i]); i++) e._distributeContent();
					this.shadyRoot._dirtyRoots = []
				},
				_finishDistribute: function () {
					if (this._useContent) {
						if (this.shadyRoot._distributionClean = !0, n.hasInsertionPoint(this.shadyRoot)) this._composeTree(),
							function (e) {
								for (var t, i = 0; i < e._insertionPoints.length; i++) t = e._insertionPoints[i], n.hasApi(t) && Polymer.dom(t).notifyObserver()
							}(this.shadyRoot);
						else if (this.shadyRoot._hasDistributed) {
							var e = this._composeNode(this);
							this._updateChildNodes(this, e)
						}
						else d.Composed.clearChildNodes(this), this.appendChild(this.shadyRoot);
						this.shadyRoot._hasDistributed || function (e) {
							n.hasApi(e) && Polymer.dom(e).notifyObserver()
						}(this), this.shadyRoot._hasDistributed = !0
					}
				},
				elementMatches: function (e, t) {
					return t = t || this, n.matchesSelector.call(t, e)
				},
				_resetDistribution: function () {
					for (var e = d.Logical.getChildNodes(this), t = 0; t < e.length; t++) {
						var i = e[t];
						i._destinationInsertionPoints && (i._destinationInsertionPoints = void 0), h(i) && o(i)
					}
					for (var n = this.shadyRoot._insertionPoints, r = 0; r < n.length; r++) n[r]._distributedNodes = []
				},
				_collectPool: function () {
					for (var e = [], t = d.Logical.getChildNodes(this), i = 0; i < t.length; i++) {
						var n = t[i];
						h(n) ? e.push.apply(e, n._distributedNodes) : e.push(n)
					}
					return e
				},
				_distributePool: function (e, t) {
					for (var i, n = e._insertionPoints, r = 0, o = n.length; r < o && (i = n[r]); r++) this._distributeInsertionPoint(i, t), s(i, this)
				},
				_distributeInsertionPoint: function (e, t) {
					for (var i, n = !1, r = 0, o = t.length; r < o; r++)(i = t[r]) && this._matchesContentSelect(i, e) && (c(i, e), n = !(t[r] = void 0));
					if (!n)
						for (var s = d.Logical.getChildNodes(e), a = 0; a < s.length; a++) c(s[a], e)
				},
				_composeTree: function () {
					this._updateChildNodes(this, this._composeNode(this));
					for (var e, t, i = this.shadyRoot._insertionPoints, n = 0, r = i.length; n < r && (e = i[n]); n++)(t = d.Logical.getParentNode(e))._useContent || t === this || t === this.shadyRoot || this._updateChildNodes(t, this._composeNode(t))
				},
				_composeNode: function (e) {
					for (var t, i, n = [], r = d.Logical.getChildNodes(e.shadyRoot || e), o = 0; o < r.length; o++) {
						var s = r[o];
						if (h(s))
							for (var a = s._distributedNodes, c = 0; c < a.length; c++) {
								var l = a[c];
								t = s, void 0, (i = l._destinationInsertionPoints) && i[i.length - 1] === t && n.push(l)
							}
						else n.push(s)
					}
					return n
				},
				_updateChildNodes: function (e, t) {
					for (var i = d.Composed.getChildNodes(e), n = Polymer.ArraySplice.calculateSplices(t, i), r = 0, o = 0; r < n.length && (c = n[r]); r++) {
						for (var s, a = 0; a < c.removed.length && (s = c.removed[a]); a++) d.Composed.getParentNode(s) === e && d.Composed.removeChild(e, s), i.splice(c.index + o, 1);
						o -= c.addedCount
					}
					var c, l;
					for (r = 0; r < n.length && (c = n[r]); r++)
						for (l = i[c.index], a = c.index; a < c.index + c.addedCount; a++) s = t[a], d.Composed.insertBefore(e, s, l), i.splice(a, 0, s)
				},
				_matchesContentSelect: function (e, t) {
					var i = t.getAttribute("select");
					if (!i) return !0;
					if (!(i = i.trim())) return !0;
					if (!(e instanceof Element)) return !1;
					return !!/^(:not\()?[*.#[a-zA-Z_|]/.test(i) && this.elementMatches(i, e)
				},
				_elementAdd: function () { },
				_elementRemove: function () { }
			});
		var e = {
			get: function () {
				var e = Polymer.dom(this).getOwnerRoot();
				return e && e.host
			},
			configurable: !0
		};

		function c(e, t) {
			t._distributedNodes.push(e);
			var i = e._destinationInsertionPoints;
			i ? i.push(t) : e._destinationInsertionPoints = [t]
		}

		function o(e) {
			var t = e._distributedNodes;
			if (t)
				for (var i = 0; i < t.length; i++) {
					var n = t[i]._destinationInsertionPoints;
					n && n.splice(n.indexOf(e) + 1, n.length)
				}
		}

		function s(e, t) {
			var i = d.Logical.getParentNode(e);
			i && i.shadyRoot && n.hasInsertionPoint(i.shadyRoot) && i.shadyRoot._distributionClean && (i.shadyRoot._distributionClean = !1, t.shadyRoot._dirtyRoots.push(i))
		}

		function h(e) {
			return "content" == e.localName
		}

		function i(e) {
			for (var t, i = d.Logical.getChildNodes(e), n = 0; n < i.length; n++)
				if ((t = i[n]).localName && "content" === t.localName) return e.domHost
		}
		Object.defineProperty(Polymer.Base, "domHost", e), Polymer.BaseDescriptors.domHost = e;
		var r = window.CustomElements && !CustomElements.useNative
	}(), Polymer.Settings.useShadow && Polymer.Base._addFeature(
		{
			_poolContent: function () { },
			_beginDistribute: function () { },
			distributeContent: function () { },
			_distributeContent: function () { },
			_finishDistribute: function () { },
			_createLocalRoot: function () {
				this.createShadowRoot(), this.shadowRoot.appendChild(this.root), this.root = this.shadowRoot
			}
		}), Polymer.Async = {
			_currVal: 0,
			_lastVal: 0,
			_callbacks: [],
			_twiddleContent: 0,
			_twiddle: document.createTextNode(""),
			run: function (e, t) {
				return 0 < t ? ~setTimeout(e, t) : (this._twiddle.textContent = this._twiddleContent++, this._callbacks.push(e), this._currVal++)
			},
			cancel: function (e) {
				if (e < 0) clearTimeout(~e);
				else {
					var t = e - this._lastVal;
					if (0 <= t) {
						if (!this._callbacks[t]) throw "invalid async handle: " + e;
						this._callbacks[t] = null
					}
				}
			},
			_atEndOfMicrotask: function () {
				for (var e = this._callbacks.length, t = 0; t < e; t++) {
					var i = this._callbacks[t];
					if (i) try {
							i()
						}
						catch (e) {
							throw t++, this._callbacks.splice(0, t), this._lastVal += t, this._twiddle.textContent = this._twiddleContent++, e
						}
				}
				this._callbacks.splice(0, e), this._lastVal += e
			}
		}, new window.MutationObserver(function () {
			Polymer.Async._atEndOfMicrotask()
		}).observe(Polymer.Async._twiddle,
			{
				characterData: !0
			}), Polymer.Debounce = function () {
				function n(e) {
					this.context = e;
					var t = this;
					this.boundComplete = function () {
						t.complete()
					}
				}
				var r = Polymer.Async;
				return n.prototype = {
					go: function (e, t) {
						var i;
						this.finish = function () {
							r.cancel(i)
						}, i = r.run(this.boundComplete, t), this.callback = e
					},
					stop: function () {
						this.finish && (this.finish(), this.finish = null, this.callback = null)
					},
					complete: function () {
						if (this.finish) {
							var e = this.callback;
							this.stop(), e.call(this.context)
						}
					}
				},
					function (e, t, i) {
						return e ? e.stop() : e = new n(this), e.go(t, i), e
					}
			}(), Polymer.Base._addFeature(
				{
					_setupDebouncers: function () {
						this._debouncers = {}
					},
					debounce: function (e, t, i) {
						return this._debouncers[e] = Polymer.Debounce.call(this, this._debouncers[e], t, i)
					},
					isDebouncerActive: function (e) {
						var t = this._debouncers[e];
						return !(!t || !t.finish)
					},
					flushDebouncer: function (e) {
						var t = this._debouncers[e];
						t && t.complete()
					},
					cancelDebouncer: function (e) {
						var t = this._debouncers[e];
						t && t.stop()
					}
				}), Polymer.DomModule = document.createElement("dom-module"), Polymer.Base._addFeature(
					{
						_registerFeatures: function () {
							this._prepIs(), this._prepBehaviors(), this._prepConstructor(), this._prepTemplate(), this._prepShady(), this._prepPropertyInfo()
						},
						_prepBehavior: function (e) {
							this._addHostAttributes(e.hostAttributes)
						},
						_initFeatures: function () {
							this._registerHost(), this._template && (this._poolContent(), this._beginHosting(), this._stampTemplate(), this._endHosting()), this._marshalHostAttributes(), this._setupDebouncers(), this._marshalBehaviors(), this._tryReady()
						},
						_marshalBehavior: function (e) { }
					}),
	function () {
		Polymer.nar = [];
		var e, c = Polymer.Settings.disableUpgradeEnabled;
		Polymer.Annotations = {
			parseAnnotations: function (e, t) {
				var i = [],
					n = e._content || e.content;
				return this._parseNodeAnnotations(n, i, t || e.hasAttribute("strip-whitespace")), i
			},
			_parseNodeAnnotations: function (e, t, i) {
				return e.nodeType === Node.TEXT_NODE ? this._parseTextNodeAnnotation(e, t) : this._parseElementAnnotations(e, t, i)
			},
			_bindingRegex: new RegExp("(\\[\\[|{{)\\s*(?:(!)\\s*)?((?:[a-zA-Z_$][\\w.:$\\-*]*)\\s*(?:\\(\\s*(?:(?:(?:(?:[a-zA-Z_$][\\w.:$\\-*]*)|(?:[-+]?[0-9]*\\.?[0-9]+(?:[eE][-+]?[0-9]+)?)|(?:(?:'(?:[^'\\\\]|\\\\.)*')|(?:\"(?:[^\"\\\\]|\\\\.)*\"))\\s*)(?:,\\s*(?:(?:[a-zA-Z_$][\\w.:$\\-*]*)|(?:[-+]?[0-9]*\\.?[0-9]+(?:[eE][-+]?[0-9]+)?)|(?:(?:'(?:[^'\\\\]|\\\\.)*')|(?:\"(?:[^\"\\\\]|\\\\.)*\"))\\s*))*)?)\\)\\s*)?)(?:]]|}})", "g"),
			_parseBindings: function (e) {
				for (var t, i = this._bindingRegex, n = [], r = 0; null !== (t = i.exec(e));) {
					t.index > r && n.push(
						{
							literal: e.slice(r, t.index)
						});
					var o, s, a, c = t[1][0],
						l = Boolean(t[2]),
						d = t[3].trim();
					"{" == c && 0 < (a = d.indexOf("::")) && (s = d.substring(a + 2), d = d.substring(0, a), o = !0), n.push(
						{
							compoundIndex: n.length,
							value: d,
							mode: c,
							negate: l,
							event: s,
							customEvent: o
						}), r = i.lastIndex
				}
				if (r && r < e.length) {
					var h = e.substring(r);
					h && n.push(
						{
							literal: h
						})
				}
				if (n.length) return n
			},
			_literalFromParts: function (e) {
				for (var t = "", i = 0; i < e.length; i++) {
					t += e[i].literal || ""
				}
				return t
			},
			_parseTextNodeAnnotation: function (e, t) {
				var i = this._parseBindings(e.textContent);
				if (i) {
					e.textContent = this._literalFromParts(i) || " ";
					var n = {
						bindings: [
							{
								kind: "text",
								name: "textContent",
								parts: i,
								isCompound: 1 !== i.length
							}]
					};
					return t.push(n), n
				}
			},
			_parseElementAnnotations: function (e, t, i) {
				var n = {
					bindings: [],
					events: []
				};
				return "content" === e.localName && (t._hasContent = !0), this._parseChildNodesAnnotations(e, n, t, i), e.attributes && (this._parseNodeAttributeAnnotations(e, n, t), this.prepElement && this.prepElement(e)), (n.bindings.length || n.events.length || n.id) && t.push(n), n
			},
			_parseChildNodesAnnotations: function (e, t, i, n) {
				if (e.firstChild)
					for (var r = e.firstChild, o = 0; r;) {
						var s = r.nextSibling;
						if ("template" !== r.localName || r.hasAttribute("preserve-content") || this._parseTemplate(r, o, i, t, n), "slot" == r.localName && (r = this._replaceSlotWithContent(r)), r.nodeType === Node.TEXT_NODE) {
							for (var a = s; a && a.nodeType === Node.TEXT_NODE;) r.textContent += a.textContent, s = a.nextSibling, e.removeChild(a), a = s;
							n && !r.textContent.trim() && (e.removeChild(r), o--)
						}
						if (r.parentNode) {
							var c = this._parseNodeAnnotations(r, i, n);
							c && (c.parent = t, c.index = o)
						}
						r = s, o++
					}
			},
			_select$Attr: (e = document.createElement("div"), e.innerHTML = "<div select$>", e.childNodes[0].attributes.getNamedItem("select$")),
			_replaceSlotWithContent: function (e) {
				for (var t = e.ownerDocument.createElement("content"); e.firstChild;) t.appendChild(e.firstChild);
				for (var i = e.attributes, n = 0; n < i.length; n++) t.attributes.setNamedItem(i[n].cloneNode());
				var r = e.getAttribute("name");
				r && t.setAttribute("select", "[slot='" + r + "']");
				var o = e.getAttribute("name$");
				if (o) {
					var s = this._select$Attr.cloneNode();
					s.value = "[slot='" + o + "']", t.attributes.setNamedItem(s)
				}
				return e.parentNode.replaceChild(t, e), t
			},
			_parseTemplate: function (e, t, i, n, r) {
				var o = document.createDocumentFragment();
				o._notes = this.parseAnnotations(e, r), o.appendChild(e.content), i.push(
					{
						bindings: Polymer.nar,
						events: Polymer.nar,
						templateContent: o,
						parent: n,
						index: t
					})
			},
			_parseNodeAttributeAnnotations: function (e, t) {
				for (var i, n = Array.prototype.slice.call(e.attributes), r = n.length - 1; i = n[r]; r--) {
					var o, s = i.name,
						a = i.value;
					"on-" === s.slice(0, 3) ? (e.removeAttribute(s), t.events.push(
						{
							name: s.slice(3),
							value: a
						})) : (o = this._parseNodeAttributeAnnotation(e, s, a)) ? t.bindings.push(o) : "id" === s && (t.id = a)
				}
			},
			_parseNodeAttributeAnnotation: function (e, t, i) {
				var n = this._parseBindings(i);
				if (n) {
					var r = t,
						o = "property";
					"$" == t[t.length - 1] && (t = t.slice(0, -1), o = "attribute");
					var s = this._literalFromParts(n);
					s && "attribute" == o && e.setAttribute(t, s), "input" === e.localName && "value" === r && e.setAttribute(r, ""), c && "disable-upgrade$" === r && e.setAttribute(t, ""), e.removeAttribute(r);
					var a = Polymer.CaseMap.dashToCamelCase(t);
					return "property" === o && (t = a),
					{
						kind: o,
						name: t,
						propertyName: a,
						parts: n,
						literal: s,
						isCompound: 1 !== n.length
					}
				}
			},
			findAnnotatedNode: function (e, t) {
				var i = t.parent && Polymer.Annotations.findAnnotatedNode(e, t.parent);
				if (!i) return e;
				for (var n = i.firstChild, r = 0; n; n = n.nextSibling)
					if (t.index === r++) return n
			}
		}
	}(), Polymer.Path = {
		root: function (e) {
			var t = e.indexOf(".");
			return -1 === t ? e : e.slice(0, t)
		},
		isDeep: function (e) {
			return -1 !== e.indexOf(".")
		},
		isAncestor: function (e, t) {
			return 0 === e.indexOf(t + ".")
		},
		isDescendant: function (e, t) {
			return 0 === t.indexOf(e + ".")
		},
		translate: function (e, t, i) {
			return t + i.slice(e.length)
		},
		matches: function (e, t, i) {
			return e === i || this.isAncestor(e, i) || Boolean(t) && this.isDescendant(e, i)
		}
	}, Polymer.Base._addFeature(
		{
			_prepAnnotations: function () {
				if (this._template) {
					var t = this;
					Polymer.Annotations.prepElement = function (e) {
						t._prepElement(e)
					}, this._template._content && this._template._content._notes ? this._notes = this._template._content._notes : (this._notes = Polymer.Annotations.parseAnnotations(this._template), this._processAnnotations(this._notes)), Polymer.Annotations.prepElement = null
				}
				else this._notes = []
			},
			_processAnnotations: function (e) {
				for (var t = 0; t < e.length; t++) {
					for (var i = e[t], n = 0; n < i.bindings.length; n++)
						for (var r = i.bindings[n], o = 0; o < r.parts.length; o++) {
							var s = r.parts[o];
							if (!s.literal) {
								var a = this._parseMethod(s.value);
								a ? s.signature = a : s.model = Polymer.Path.root(s.value)
							}
						}
					if (i.templateContent) {
						this._processAnnotations(i.templateContent._notes);
						var c = i.templateContent._parentProps = this._discoverTemplateParentProps(i.templateContent._notes),
							l = [];
						for (var d in c) {
							var h = "_parent_" + d;
							l.push(
								{
									index: i.index,
									kind: "property",
									name: h,
									propertyName: h,
									parts: [
										{
											mode: "{",
											model: d,
											value: d
										}]
								})
						}
						i.bindings = i.bindings.concat(l)
					}
				}
			},
			_discoverTemplateParentProps: function (e) {
				for (var t, i = {}, n = 0; n < e.length && (t = e[n]); n++) {
					for (var r, o = 0, s = t.bindings; o < s.length && (r = s[o]); o++)
						for (var a, c = 0, l = r.parts; c < l.length && (a = l[c]); c++)
							if (a.signature) {
								for (var d = a.signature.args, h = 0; h < d.length; h++) {
									var u = d[h].model;
									u && (i[u] = !0)
								}
								a.signature.dynamicFn && (i[a.signature.method] = !0)
							}
							else a.model && (i[a.model] = !0);
					if (t.templateContent) {
						var p = t.templateContent._parentProps;
						Polymer.Base.mixin(i, p)
					}
				}
				return i
			},
			_prepElement: function (e) {
				Polymer.ResolveUrl.resolveAttrs(e, this._template.ownerDocument)
			},
			_findAnnotatedNode: Polymer.Annotations.findAnnotatedNode,
			_marshalAnnotationReferences: function () {
				this._template && (this._marshalIdNodes(), this._marshalAnnotatedNodes(), this._marshalAnnotatedListeners())
			},
			_configureAnnotationReferences: function () {
				for (var e = this._notes || [], t = this._nodes, i = 0; i < e.length; i++) {
					var n = e[i],
						r = t[i];
					this._configureTemplateContent(n, r), this._configureCompoundBindings(n, r)
				}
			},
			_configureTemplateContent: function (e, t) {
				e.templateContent && (t._content = e.templateContent)
			},
			_configureCompoundBindings: function (e, t) {
				for (var i = e.bindings, n = 0; n < i.length; n++) {
					var r = i[n];
					if (r.isCompound) {
						for (var o = t.__compoundStorage__ || (t.__compoundStorage__ = {}), s = r.parts, a = new Array(s.length), c = 0; c < s.length; c++) a[c] = s[c].literal;
						var l = r.name;
						o[l] = a, r.literal && "property" == r.kind && (t._configValue ? t._configValue(l, r.literal) : t[l] = r.literal)
					}
				}
			},
			_marshalIdNodes: function () {
				this.$ = {};
				for (var e, t = 0, i = this._notes.length; t < i && (e = this._notes[t]); t++) e.id && (this.$[e.id] = this._findAnnotatedNode(this.root, e))
			},
			_marshalAnnotatedNodes: function () {
				if (this._notes && this._notes.length) {
					for (var e = new Array(this._notes.length), t = 0; t < this._notes.length; t++) e[t] = this._findAnnotatedNode(this.root, this._notes[t]);
					this._nodes = e
				}
			},
			_marshalAnnotatedListeners: function () {
				for (var e, t = 0, i = this._notes.length; t < i && (e = this._notes[t]); t++)
					if (e.events && e.events.length)
						for (var n, r = this._findAnnotatedNode(this.root, e), o = 0, s = e.events; o < s.length && (n = s[o]); o++) this.listen(r, n.name, n.value)
			}
		}), Polymer.Base._addFeature(
			{
				listeners:
					{},
				_listenListeners: function (e) {
					var t, i, n;
					for (n in e) i = n.indexOf(".") < 0 ? (t = this, n) : (i = n.split("."), t = this.$[i[0]], i[1]), this.listen(t, i, e[n])
				},
				listen: function (e, t, i) {
					var n = this._recallEventHandler(this, t, e, i);
					(n = n || this._createEventHandler(e, t, i))._listening || (this._listen(e, t, n), n._listening = !0)
				},
				_boundListenerKey: function (e, t) {
					return e + ":" + t
				},
				_recordEventHandler: function (e, t, i, n, r) {
					var o = e.__boundListeners,
						s = (o = o || (e.__boundListeners = new WeakMap)).get(i);
					s || (s = {}, Polymer.Settings.isIE && i == window || o.set(i, s)), s[this._boundListenerKey(t, n)] = r
				},
				_recallEventHandler: function (e, t, i, n) {
					var r = e.__boundListeners;
					if (r) {
						var o = r.get(i);
						if (o) return o[this._boundListenerKey(t, n)]
					}
				},
				_createEventHandler: function (e, t, i) {
					function n(e) {
						r[i] ? r[i](e, e.detail) : r._warn(r._logf("_createEventHandler", "listener method `" + i + "` not defined"))
					}
					var r = this;
					return n._listening = !1, this._recordEventHandler(r, t, e, i, n), n
				},
				unlisten: function (e, t, i) {
					var n = this._recallEventHandler(this, t, e, i);
					n && (this._unlisten(e, t, n), n._listening = !1)
				},
				_listen: function (e, t, i) {
					e.addEventListener(t, i)
				},
				_unlisten: function (e, t, i) {
					e.removeEventListener(t, i)
				}
			}),
	function () {
		"use strict";
		var d = Polymer.DomApi.wrap,
			l = "string" == typeof document.head.style.touchAction,
			h = "__polymerGestures",
			u = "__polymerGesturesHandled",
			a = "__polymerGesturesTouchAction",
			r = ["mousedown", "mousemove", "mouseup", "click"],
			n = [0, 1, 4, 2],
			o = function () {
				try {
					return 1 === new MouseEvent("test",
						{
							buttons: 1
						}).buttons
				}
				catch (e) {
					return !1
				}
			}();

		function p(e) {
			return -1 < r.indexOf(e)
		}
		var t = !1;

		function f(e) {
			if (!p(e) && "touchend" !== e) return l && t && Polymer.Settings.passiveTouchGestures ?
				{
					passive: !0
				} : void 0
		} ! function () {
			try {
				var e = Object.defineProperty(
					{}, "passive",
					{
						get: function () {
							t = !0
						}
					});
				window.addEventListener("test", null, e), window.removeEventListener("test", null, e)
			}
			catch (e) { }
		}();
		var m = navigator.userAgent.match(/iP(?:[oa]d|hone)|Android/),
			s = function (e) {
				var t = e.sourceCapabilities;
				if ((!t || t.firesTouchEvents) && (e[u] = {
					skip: !0
				}, "click" === e.type)) {
					var i = Polymer.dom(e).path;
					if (i)
						for (var n = 0; n < i.length; n++)
							if (i[n] === v.mouse.target) return;
					e.preventDefault(), e.stopPropagation()
				}
			};

		function i(e) {
			for (var t, i = m ? ["click"] : r, n = 0; n < i.length; n++) t = i[n], e ? document.addEventListener(t, s, !0) : document.removeEventListener(t, s, !0)
		}

		function c(e) {
			var t = e.type;
			if (!p(t)) return !1;
			if ("mousemove" !== t) return 0 === (void 0 === e.button ? 0 : e.button);
			var i = void 0 === e.buttons ? 1 : e.buttons;
			return e instanceof window.MouseEvent && !o && (i = n[e.which] || 0), Boolean(1 & i)
		}
		var v = {
			mouse:
			{
				target: null,
				mouseIgnoreJob: null
			},
			touch:
			{
				x: 0,
				y: 0,
				id: -1,
				scrollDecided: !1
			}
		};

		function _(e, t, i) {
			e.movefn = t, e.upfn = i, document.addEventListener("mousemove", t), document.addEventListener("mouseup", i)
		}

		function y(e) {
			document.removeEventListener("mousemove", e.movefn), document.removeEventListener("mouseup", e.upfn), e.movefn = null, e.upfn = null
		}
		document.addEventListener("touchend", function (e) {
			v.mouse.mouseIgnoreJob || i(!0), v.mouse.target = Polymer.dom(e).rootTarget, v.mouse.mouseIgnoreJob = Polymer.Debounce(v.mouse.mouseIgnoreJob, function () {
				i(), v.mouse.target = null, v.mouse.mouseIgnoreJob = null
			}, 2500)
		}, !!t &&
		{
			passive: !0
		});
		var g = {
			gestures:
				{},
			recognizers: [],
			deepTargetFind: function (e, t) {
				for (var i = document.elementFromPoint(e, t), n = i; n && n.shadowRoot;) {
					if (n === (n = n.shadowRoot.elementFromPoint(e, t))) break;
					n && (i = n)
				}
				return i
			},
			findOriginalTarget: function (e) {
				return e.path ? e.path[0] : e.target
			},
			handleNative: function (e) {
				var t, i = e.type,
					n = d(e.currentTarget)[h];
				if (n) {
					var r = n[i];
					if (r) {
						if (!e[u] && (e[u] = {}, "touch" === i.slice(0, 5))) {
							var o = e.changedTouches[0];
							if ("touchstart" === i && 1 === e.touches.length && (v.touch.id = o.identifier), v.touch.id !== o.identifier) return;
							l || "touchstart" !== i && "touchmove" !== i || g.handleTouchAction(e)
						}
						if (!(t = e[u]).skip) {
							for (var s, a = g.recognizers, c = 0; c < a.length; c++)
								r[(s = a[c]).name] && !t[s.name] && s.flow && -1 < s.flow.start.indexOf(e.type) && s.reset && s.reset();

							for (c = 0; c < a.length; c++)
								r[(s = a[c]).name] && !t[s.name] && (t[s.name] = !0, s[i](e))
						}
					}
				}
			},
			handleTouchAction: function (e) {
				var t = e.changedTouches[0],
					i = e.type;
				if ("touchstart" === i) v.touch.x = t.clientX, v.touch.y = t.clientY, v.touch.scrollDecided = !1;
				else if ("touchmove" === i) {
					if (v.touch.scrollDecided) return;
					v.touch.scrollDecided = !0;
					var n = function (e) {
						for (var t, i = Polymer.dom(e).path, n = "auto", r = 0; r < i.length; r++)
							if ((t = i[r])[a]) {
								n = t[a];
								break
							} return n
					}(e),
						r = !1,
						o = Math.abs(v.touch.x - t.clientX),
						s = Math.abs(v.touch.y - t.clientY);
					e.cancelable && ("none" === n ? r = !0 : "pan-x" === n ? r = o < s : "pan-y" === n && (r = s < o)), r ? e.preventDefault() : g.prevent("track")
				}
			},
			add: function (e, t, i) {
				e = d(e);
				var n = this.gestures[t],
					r = n.deps,
					o = n.name,
					s = e[h];
				s || (e[h] = s = {});
				for (var a, c, l = 0; l < r.length; l++) a = r[l], m && p(a) && "click" !== a || ((c = s[a]) || (s[a] = c = {
					_count: 0
				}), 0 === c._count && e.addEventListener(a, this.handleNative, f(a)), c[o] = (c[o] || 0) + 1, c._count = (c._count || 0) + 1);
				e.addEventListener(t, i), n.touchAction && this.setTouchAction(e, n.touchAction)
			},
			remove: function (e, t, i) {
				e = d(e);
				var n = this.gestures[t],
					r = n.deps,
					o = n.name,
					s = e[h];
				if (s)
					for (var a, c, l = 0; l < r.length; l++)(c = s[a = r[l]]) && c[o] && (c[o] = (c[o] || 1) - 1, c._count = (c._count || 1) - 1, 0 === c._count && e.removeEventListener(a, this.handleNative, f(a)));
				e.removeEventListener(t, i)
			},
			register: function (e) {
				this.recognizers.push(e);
				for (var t = 0; t < e.emits.length; t++) this.gestures[e.emits[t]] = e
			},
			findRecognizerByEvent: function (e) {
				for (var t, i = 0; i < this.recognizers.length; i++) {
					t = this.recognizers[i];
					for (var n = 0; n < t.emits.length; n++)
						if (t.emits[n] === e) return t
				}
				return null
			},
			setTouchAction: function (e, t) {
				l && (e.style.touchAction = t), e[a] = t
			},
			fire: function (e, t, i) {
				if (Polymer.Base.fire(t, i,
					{
						node: e,
						bubbles: !0,
						cancelable: !0
					}).defaultPrevented) {
					var n = i.preventer || i.sourceEvent;
					n && n.preventDefault && n.preventDefault()
				}
			},
			prevent: function (e) {
				var t = this.findRecognizerByEvent(e);
				t.info && (t.info.prevent = !0)
			},
			resetMouseCanceller: function () {
				v.mouse.mouseIgnoreJob && v.mouse.mouseIgnoreJob.complete()
			}
		};
		g.register(
			{
				name: "downup",
				deps: ["mousedown", "touchend"],
				flow:
				{
					start: ["mousedown"],
					end: ["mouseup", "touchend"]
				},
				emits: ["down", "up"],
				info:
				{
					movefn: null,
					upfn: null
				},
				reset: function () {
					y(this.info)
				},
				mousedown: function (e) {
					if (c(e)) {
						var t = g.findOriginalTarget(e),
							i = this;
						_(this.info, function (e) {
							c(e) || (i.fire("up", t, e), y(i.info))
						}, function (e) {
							c(e) && i.fire("up", t, e), y(i.info)
						}), this.fire("down", t, e)
					}
				},
				touchstart: function (e) {
					this.fire("down", g.findOriginalTarget(e), e.changedTouches[0], e)
				},
				touchend: function (e) {
					this.fire("up", g.findOriginalTarget(e), e.changedTouches[0], e)
				},
				fire: function (e, t, i, n) {
				}
			}), g.register(
				{
					name: "track",
					touchAction: "none",
					deps: ["mousedown"],
					flow:
					{
						start: ["mousedown"],
						end: ["mouseup", "touchend"]
					},
					emits: ["track"],
					info:
					{
						x: 0,
						y: 0,
						state: "start",
						started: !1,
						moves: [],
						addMove: function (e) {
							2 < this.moves.length && this.moves.shift(), this.moves.push(e)
						},
						movefn: null,
						upfn: null,
						prevent: !1
					},
					reset: function () {
						this.info.state = "start", this.info.started = !1, this.info.moves = [], this.info.x = 0, this.info.y = 0, this.info.prevent = !1, y(this.info)
					},
					hasMovedEnough: function (e, t) {
						if (this.info.prevent) return !1;
						if (this.info.started) return !0;
						var i = Math.abs(this.info.x - e),
							n = Math.abs(this.info.y - t);
						return 5 <= i || 5 <= n
					},
					mousedown: function (e) {
						if (c(e)) {
							var n = g.findOriginalTarget(e),
								r = this,
								t = function (e) {
									var t = e.clientX,
										i = e.clientY;
									r.hasMovedEnough(t, i) && (r.info.state = r.info.started ? "mouseup" === e.type ? "end" : "track" : "start", "start" === r.info.state && g.prevent("tap"), r.info.addMove(
										{
											x: t,
											y: i
										}), c(e) || (r.info.state = "end", y(r.info)), r.fire(n, e), r.info.started = !0)
								};
							_(this.info, t, function (e) {
								r.info.started && t(e), y(r.info)
							}), this.info.x = e.clientX, this.info.y = e.clientY
						}
					},
					touchstart: function (e) {
						var t = e.changedTouches[0];
						this.info.x = t.clientX, this.info.y = t.clientY
					},
					touchmove: function (e) {
						var t = g.findOriginalTarget(e),
							i = e.changedTouches[0],
							n = i.clientX,
							r = i.clientY;
						this.hasMovedEnough(n, r) && ("start" === this.info.state && g.prevent("tap"), this.info.addMove(
							{
								x: n,
								y: r
							}), this.fire(t, i), this.info.state = "track", this.info.started = !0)
					},
					touchend: function (e) {
						var t = g.findOriginalTarget(e),
							i = e.changedTouches[0];
						this.info.started && (this.info.state = "end", this.info.addMove(
							{
								x: i.clientX,
								y: i.clientY
							}), this.fire(t, i, e))
					},
					fire: function (e, t, i) {
						var n, r = this.info.moves[this.info.moves.length - 2],
							o = this.info.moves[this.info.moves.length - 1],
							s = o.x - this.info.x,
							a = o.y - this.info.y,
							c = 0;
						return r && (n = o.x - r.x, c = o.y - r.y), g.fire(e, "track",
							{
								state: this.info.state,
								x: t.clientX,
								y: t.clientY,
								dx: s,
								dy: a,
								ddx: n,
								ddy: c,
								sourceEvent: t,
								preventer: i,
								hover: function () {
									return g.deepTargetFind(t.clientX, t.clientY)
								}
							})
					}
				}), g.register(
					{
						name: "tap",
						deps: ["mousedown", "click", "touchend"],
						flow:
						{
							start: ["mousedown"],
							end: ["click", "touchend"]
						},
						emits: ["tap"],
						info:
						{
							x: NaN,
							y: NaN,
							prevent: !1
						},
						reset: function () {
							this.info.x = NaN, this.info.y = NaN, this.info.prevent = !1
						},
						save: function (e) {
							this.info.x = e.clientX, this.info.y = e.clientY
						},
						mousedown: function (e) {
							c(e) && this.save(e)
						},
						click: function (e) {
							c(e) && this.forward(e)
						},
						touchstart: function (e) {
							this.save(e.changedTouches[0], e)
						},
						touchend: function (e) {
							this.forward(e.changedTouches[0], e)
						},
						forward: function (e, t) {
							var i = Math.abs(e.clientX - this.info.x),
								n = Math.abs(e.clientY - this.info.y),
								r = g.findOriginalTarget(e);
							(isNaN(i) || isNaN(n) || i <= 25 && n <= 25 || function (e) {
								if ("click" !== e.type) return !1;
								if (0 === e.detail) return !0;
								var t = g.findOriginalTarget(e).getBoundingClientRect(),
									i = e.pageX,
									n = e.pageY;
								return !(i >= t.left && i <= t.right && n >= t.top && n <= t.bottom)
							}(e)) && (this.info.prevent || g.fire(r, "tap",
								{
									x: e.clientX,
									y: e.clientY,
									sourceEvent: e,
									preventer: t
								}))
						}
					});
		var b = {
			x: "pan-x",
			y: "pan-y",
			none: "none",
			all: "auto"
		};
		Polymer.Base._addFeature(
			{
				_setupGestures: function () {
					this.__polymerGestures = null
				},
				_listen: function (e, t, i) {
					g.gestures[t] ? g.add(e, t, i) : e.addEventListener(t, i)
				},
				_unlisten: function (e, t, i) {
					g.gestures[t] ? g.remove(e, t, i) : e.removeEventListener(t, i)
				},
				setScrollDirection: function (e, t) {
					t = t || this, g.setTouchAction(t, b[e] || "auto")
				}
			}), Polymer.Gestures = g
	}(),
	function () {
		"use strict";
		if (Polymer.Base._addFeature(
			{
				$$: function (e) {
					return Polymer.dom(this.root).querySelector(e)
				},
				toggleClass: function (e, t, i) {
					i = i || this, 1 == arguments.length && (t = !i.classList.contains(e)), t ? Polymer.dom(i).classList.add(e) : Polymer.dom(i).classList.remove(e)
				},
				toggleAttribute: function (e, t, i) {
					i = i || this, 1 == arguments.length && (t = !i.hasAttribute(e)), t ? Polymer.dom(i).setAttribute(e, "") : Polymer.dom(i).removeAttribute(e)
				},
				classFollows: function (e, t, i) {
					i && Polymer.dom(i).classList.remove(e), t && Polymer.dom(t).classList.add(e)
				},
				attributeFollows: function (e, t, i) {
					i && Polymer.dom(i).removeAttribute(e), t && Polymer.dom(t).setAttribute(e, "")
				},
				getEffectiveChildNodes: function () {
					return Polymer.dom(this).getEffectiveChildNodes()
				},
				getEffectiveChildren: function () {
					return Polymer.dom(this).getEffectiveChildNodes().filter(function (e) {
						return e.nodeType === Node.ELEMENT_NODE
					})
				},
				getEffectiveTextContent: function () {
					for (var e, t = this.getEffectiveChildNodes(), i = [], n = 0; e = t[n]; n++) e.nodeType !== Node.COMMENT_NODE && i.push(Polymer.dom(e).textContent);
					return i.join("")
				},
				queryEffectiveChildren: function (e) {
					var t = Polymer.dom(this).queryDistributedElements(e);
					return t && t[0]
				},
				queryAllEffectiveChildren: function (e) {
					return Polymer.dom(this).queryDistributedElements(e)
				},
				getContentChildNodes: function (e) {
					var t = Polymer.dom(this.root).querySelector(e || "content");
					return t ? Polymer.dom(t).getDistributedNodes() : []
				},
				getContentChildren: function (e) {
					return this.getContentChildNodes(e).filter(function (e) {
						return e.nodeType === Node.ELEMENT_NODE
					})
				},
				fire: function (e, t, i) {
					var n = (i = i || Polymer.nob).node || this;
					t = null == t ?
						{} : t;
					var r = void 0 === i.bubbles || i.bubbles,
						o = Boolean(i.cancelable),
						s = i._useCache,
						a = this._getEvent(e, r, o, s);
					return a.detail = t, s && (this.__eventCache[e] = null), n.dispatchEvent(a), s && (this.__eventCache[e] = a), a
				},
				__eventCache:
					{},
				_getEvent: function (e, t, i, n) {
					var r = n && this.__eventCache[e];
					return r && r.bubbles == t && r.cancelable == i || (r = new Event(e,
						{
							bubbles: Boolean(t),
							cancelable: i
						})), r
				},
				async: function (e, t) {
					var i = this;
					return Polymer.Async.run(function () {
						e.call(i)
					}, t)
				},
				cancelAsync: function (e) {
					Polymer.Async.cancel(e)
				},
				arrayDelete: function (e, t) {
					var i;
					if (Array.isArray(e)) {
						if (0 <= (i = e.indexOf(t))) return e.splice(i, 1)
					}
					else if (0 <= (i = this._get(e).indexOf(t))) return this.splice(e, i, 1)
				},
				transform: function (e, t) {
					(t = t || this).style.webkitTransform = e, t.style.transform = e
				},
				translate3d: function (e, t, i, n) {
					n = n || this, this.transform("translate3d(" + e + "," + t + "," + i + ")", n)
				},
				importHref: function (e, t, i, n) {
					var r = document.createElement("link");
					r.rel = "import", r.href = e;
					var o = Polymer.Base.importHref.imported = Polymer.Base.importHref.imported ||
						{},
						s = o[r.href],
						a = s || r,
						c = this,
						l = function (e) {
							return e.target.__firedLoad = !0, e.target.removeEventListener("load", l), e.target.removeEventListener("error", d), t.call(c, e)
						},
						d = function (e) {
							return e.target.__firedError = !0, e.target.removeEventListener("load", l), e.target.removeEventListener("error", d), i.call(c, e)
						};
					return t && a.addEventListener("load", l), i && a.addEventListener("error", d), s ? (s.__firedLoad && s.dispatchEvent(new Event("load")), s.__firedError && s.dispatchEvent(new Event("error"))) : (o[r.href] = r, (n = Boolean(n)) && r.setAttribute("async", ""), document.head.appendChild(r)), a
				},
				create: function (e, t) {
					var i = document.createElement(e);
					if (t)
						for (var n in t) i[n] = t[n];
					return i
				},
				isLightDescendant: function (e) {
					return this !== e && this.contains(e) && Polymer.dom(this).getOwnerRoot() === Polymer.dom(e).getOwnerRoot()
				},
				isLocalDescendant: function (e) {
					return this.root === Polymer.dom(e).getOwnerRoot()
				}
			}), !Polymer.Settings.useNativeCustomElements) {
			var r = Polymer.Base.importHref;
			Polymer.Base.importHref = function (e, t, i, n) {
				CustomElements.ready = !1;
				return r.call(this, e, function (e) {
					if (CustomElements.upgradeDocumentTree(document), CustomElements.ready = !0, t) return t.call(this, e)
				}, i, n)
			}
		}
	}(), Polymer.Bind = {
		prepareModel: function (e) {
			Polymer.Base.mixin(e, this._modelApi)
		},
		_modelApi:
		{
			_notifyChange: function (e, t, i) {
				i = void 0 === i ? this[e] : i, t = t || Polymer.CaseMap.camelToDashCase(e) + "-changed", this.fire(t,
					{
						value: i
					},
					{
						bubbles: !1,
						cancelable: !1,
						_useCache: Polymer.Settings.eventDataCache || !Polymer.Settings.isIE
					})
			},
			_propertySetter: function (e, t, i, n) {
				var r = this.__data__[e];
				return r === t || r != r && t != t || ("object" == typeof (this.__data__[e] = t) && this._clearPath(e), this._propertyChanged && this._propertyChanged(e, t, r), i && this._effectEffects(e, t, i, r, n)), r
			},
			__setProperty: function (e, t, i, n) {
				var r = (n = n || this)._propertyEffects && n._propertyEffects[e];
				r ? n._propertySetter(e, t, r, i) : n[e] !== t && (n[e] = t)
			},
			_effectEffects: function (e, t, i, n, r) {
				for (var o, s = 0, a = i.length; s < a && (o = i[s]); s++) o.fn.call(this, e, this[e], o.effect, n, r)
			},
			_clearPath: function (e) {
				for (var t in this.__data__) Polymer.Path.isDescendant(e, t) && (this.__data__[t] = void 0)
			}
		},
		ensurePropertyEffects: function (e, t) {
			e._propertyEffects || (e._propertyEffects = {});
			var i = e._propertyEffects[t];
			return i = i || (e._propertyEffects[t] = [])
		},
		addPropertyEffect: function (e, t, i, n) {
			var r = this.ensurePropertyEffects(e, t),
				o = {
					kind: i,
					effect: n,
					fn: Polymer.Bind["_" + i + "Effect"]
				};
			return r.push(o), o
		},
		createBindings: function (e) {
			var t = e._propertyEffects;
			if (t)
				for (var i in t) {
					var n = t[i];
					n.sort(this._sortPropertyEffects), this._createAccessors(e, i, n)
				}
		},
		_sortPropertyEffects: function () {
			var i = {
				compute: 0,
				annotation: 1,
				annotatedComputation: 2,
				reflect: 3,
				notify: 4,
				observer: 5,
				complexObserver: 6,
				function: 7
			};
			return function (e, t) {
				return i[e.kind] - i[t.kind]
			}
		}(),
		_createAccessors: function (e, t, i) {
			function n(e) {
				this._propertySetter(t, e, i)
			}
			var r = {
				get: function () {
					return this.__data__[t]
				}
			},
				o = e.getPropertyInfo && e.getPropertyInfo(t);
			o && o.readOnly ? o.computed || (e["_set" + this.upper(t)] = n) : r.set = n, Object.defineProperty(e, t, r)
		},
		upper: function (e) {
			return e[0].toUpperCase() + e.substring(1)
		},
		_addAnnotatedListener: function (e, t, i, n, r, o) {
			e._bindListeners || (e._bindListeners = []);
			var s = this._notedListenerFactory(i, n, Polymer.Path.isDeep(n), o),
				a = r || Polymer.CaseMap.camelToDashCase(i) + "-changed";
			e._bindListeners.push(
				{
					index: t,
					property: i,
					path: n,
					changedFn: s,
					event: a
				})
		},
		_isEventBogus: function (e, t) {
			return e.path && e.path[0] !== t
		},
		_notedListenerFactory: function (r, o, s, a) {
			return function (e, t, i) {
				if (i) {
					var n = Polymer.Path.translate(r, o, i);
					this._notifyPath(n, t)
				}
				else t = e[r], a && (t = !t), s ? this.__data__[o] != t && this.set(o, t) : this[o] = t
			}
		},
		prepareInstance: function (e) {
			e.__data__ = Object.create(null)
		},
		setupBindListeners: function (e) {
			for (var t, i = e._bindListeners, n = 0, r = i.length; n < r && (t = i[n]); n++) {
				var o = e._nodes[t.index];
				this._addNotifyListener(o, e, t.event, t.changedFn)
			}
		},
		_addNotifyListener: function (e, t, i, n) {
			e.addEventListener(i, function (e) {
				return t._notifyListener(n, e)
			})
		}
	}, Polymer.Base.mixin(Polymer.Bind,
		{
			_shouldAddListener: function (e) {
				return e.name && "attribute" != e.kind && "text" != e.kind && !e.isCompound && "{" === e.parts[0].mode
			},
			_annotationEffect: function (e, t, i) {
				e != i.value && (t = this._get(i.value), this.__data__[i.value] = t), this._applyEffectValue(i, t)
			},
			_reflectEffect: function (e, t, i) {
				this.reflectPropertyToAttribute(e, i.attribute, t)
			},
			_notifyEffect: function (e, t, i, n, r) {
				r || this._notifyChange(e, i.event, t)
			},
			_functionEffect: function (e, t, i, n, r) {
				i.call(this, e, t, n, r)
			},
			_observerEffect: function (e, t, i, n) {
				var r = this[i.method];
				r ? r.call(this, t, n) : this._warn(this._logf("_observerEffect", "observer method `" + i.method + "` not defined"))
			},
			_complexObserverEffect: function (e, t, i) {
				var n = this[i.method];
				if (n) {
					var r = Polymer.Bind._marshalArgs(this.__data__, i, e, t);
					r && n.apply(this, r)
				}
				else i.dynamicFn || this._warn(this._logf("_complexObserverEffect", "observer method `" + i.method + "` not defined"))
			},
			_computeEffect: function (e, t, i) {
				var n = this[i.method];
				if (n) {
					var r = Polymer.Bind._marshalArgs(this.__data__, i, e, t);
					if (r) {
						var o = n.apply(this, r);
						this.__setProperty(i.name, o)
					}
				}
				else i.dynamicFn || this._warn(this._logf("_computeEffect", "compute method `" + i.method + "` not defined"))
			},
			_annotatedComputationEffect: function (e, t, i) {
				var n = this._rootDataHost || this,
					r = n[i.method];
				if (r) {
					var o = Polymer.Bind._marshalArgs(this.__data__, i, e, t);
					if (o) {
						var s = r.apply(n, o);
						this._applyEffectValue(i, s)
					}
				}
				else i.dynamicFn || n._warn(n._logf("_annotatedComputationEffect", "compute method `" + i.method + "` not defined"))
			},
			_marshalArgs: function (e, t, i, n) {
				for (var r = [], o = t.args, s = 1 < o.length || t.dynamicFn, a = 0, c = o.length; a < c; a++) {
					var l, d = o[a],
						h = d.name;
					if (d.literal ? l = d.value : i === h ? l = n : void 0 === (l = e[h]) && d.structured && (l = Polymer.Base._get(h, e)), s && void 0 === l) return;
					if (d.wildcard) {
						var u = Polymer.Path.isAncestor(i, h);
						r[a] = {
							path: u ? i : h,
							value: u ? n : l,
							base: l
						}
					}
					else r[a] = l
				}
				return r
			}
		}), Polymer.Base._addFeature(
			{
				_addPropertyEffect: function (e, t, i) {
					var n = Polymer.Bind.addPropertyEffect(this, e, t, i);
					n.pathFn = this["_" + n.kind + "PathEffect"]
				},
				_prepEffects: function () {
					Polymer.Bind.prepareModel(this), this._addAnnotationEffects(this._notes)
				},
				_prepBindings: function () {
					Polymer.Bind.createBindings(this)
				},
				_addPropertyEffects: function (e) {
					if (e)
						for (var t in e) {
							var i = e[t];
							if (i.observer && this._addObserverEffect(t, i.observer), i.computed && (i.readOnly = !0, this._addComputedEffect(t, i.computed)), i.notify && this._addPropertyEffect(t, "notify",
								{
									event: Polymer.CaseMap.camelToDashCase(t) + "-changed"
								}), i.reflectToAttribute) {
								var n = Polymer.CaseMap.camelToDashCase(t);
								"-" === n[0] ? this._warn(this._logf("_addPropertyEffects", "Property " + t + " cannot be reflected to attribute " + n + ' because "-" is not a valid starting attribute name. Use a lowercase first letter for the property instead.')) : this._addPropertyEffect(t, "reflect",
									{
										attribute: n
									})
							}
							i.readOnly && Polymer.Bind.ensurePropertyEffects(this, t)
						}
				},
				_addComputedEffect: function (e, t) {
					for (var i, n = this._parseMethod(t), r = n.dynamicFn, o = 0; o < n.args.length && (i = n.args[o]); o++) this._addPropertyEffect(i.model, "compute",
						{
							method: n.method,
							args: n.args,
							trigger: i,
							name: e,
							dynamicFn: r
						});
					r && this._addPropertyEffect(n.method, "compute",
						{
							method: n.method,
							args: n.args,
							trigger: null,
							name: e,
							dynamicFn: r
						})
				},
				_addObserverEffect: function (e, t) {
					this._addPropertyEffect(e, "observer",
						{
							method: t,
							property: e
						})
				},
				_addComplexObserverEffects: function (e) {
					if (e)
						for (var t, i = 0; i < e.length && (t = e[i]); i++) this._addComplexObserverEffect(t)
				},
				_addComplexObserverEffect: function (e) {
					var t = this._parseMethod(e);
					if (!t) throw new Error("Malformed observer expression '" + e + "'");
					for (var i, n = t.dynamicFn, r = 0; r < t.args.length && (i = t.args[r]); r++) this._addPropertyEffect(i.model, "complexObserver",
						{
							method: t.method,
							args: t.args,
							trigger: i,
							dynamicFn: n
						});
					n && this._addPropertyEffect(t.method, "complexObserver",
						{
							method: t.method,
							args: t.args,
							trigger: null,
							dynamicFn: n
						})
				},
				_addAnnotationEffects: function (e) {
					for (var t, i = 0; i < e.length && (t = e[i]); i++)
						for (var n, r = t.bindings, o = 0; o < r.length && (n = r[o]); o++) this._addAnnotationEffect(n, i)
				},
				_addAnnotationEffect: function (e, t) {
					Polymer.Bind._shouldAddListener(e) && Polymer.Bind._addAnnotatedListener(this, t, e.name, e.parts[0].value, e.parts[0].event, e.parts[0].negate);
					for (var i = 0; i < e.parts.length; i++) {
						var n = e.parts[i];
						n.signature ? this._addAnnotatedComputationEffect(e, n, t) : n.literal || ("attribute" === e.kind && "-" === e.name[0] ? this._warn(this._logf("_addAnnotationEffect", "Cannot set attribute " + e.name + ' because "-" is not a valid attribute starting character')) : this._addPropertyEffect(n.model, "annotation",
							{
								kind: e.kind,
								index: t,
								name: e.name,
								propertyName: e.propertyName,
								value: n.value,
								isCompound: e.isCompound,
								compoundIndex: n.compoundIndex,
								event: n.event,
								customEvent: n.customEvent,
								negate: n.negate
							}))
					}
				},
				_addAnnotatedComputationEffect: function (e, t, i) {
					var n = t.signature;
					if (n.static) this.__addAnnotatedComputationEffect("__static__", i, e, t, null);
					else {
						for (var r, o = 0; o < n.args.length && (r = n.args[o]); o++) r.literal || this.__addAnnotatedComputationEffect(r.model, i, e, t, r);
						n.dynamicFn && this.__addAnnotatedComputationEffect(n.method, i, e, t, null)
					}
				},
				__addAnnotatedComputationEffect: function (e, t, i, n, r) {
					this._addPropertyEffect(e, "annotatedComputation",
						{
							index: t,
							isCompound: i.isCompound,
							compoundIndex: n.compoundIndex,
							kind: i.kind,
							name: i.name,
							negate: n.negate,
							method: n.signature.method,
							args: n.signature.args,
							trigger: r,
							dynamicFn: n.signature.dynamicFn
						})
				},
				_parseMethod: function (e) {
					var t = e.match(/([^\s]+?)\(([\s\S]*)\)/);
					if (t) {
						var i = {
							method: t[1],
							static: !0
						};
						if (this.getPropertyInfo(i.method) !== Polymer.nob && (i.static = !1, i.dynamicFn = !0), t[2].trim()) {
							var n = t[2].replace(/\\,/g, "&comma;").split(",");
							return this._parseArgs(n, i)
						}
						return i.args = Polymer.nar, i
					}
				},
				_parseArgs: function (e, i) {
					return i.args = e.map(function (e) {
						var t = this._parseArg(e);
						return t.literal || (i.static = !1), t
					}, this), i
				},
				_parseArg: function (e) {
					var t = e.trim().replace(/&comma;/g, ",").replace(/\\(.)/g, "$1"),
						i = {
							name: t
						},
						n = t[0];
					switch ("-" === n && (n = t[1]), "0" <= n && n <= "9" && (n = "#"), n) {
						case "'":
						case '"':
							i.value = t.slice(1, -1), i.literal = !0;
							break;
						case "#":
							i.value = Number(t), i.literal = !0
					}
					return i.literal || (i.model = Polymer.Path.root(t), i.structured = Polymer.Path.isDeep(t), i.structured && (i.wildcard = ".*" == t.slice(-2), i.wildcard && (i.name = t.slice(0, -2)))), i
				},
				_marshalInstanceEffects: function () {
					Polymer.Bind.prepareInstance(this), this._bindListeners && Polymer.Bind.setupBindListeners(this)
				},
				_applyEffectValue: function (e, t) {
					var i = this._nodes[e.index],
						n = e.name;
					if (t = this._computeFinalAnnotationValue(i, n, t, e), "attribute" == e.kind) this.serializeValueToAttribute(t, n, i);
					else {
						var r = i._propertyInfo && i._propertyInfo[n];
						if (r && r.readOnly) return;
						this.__setProperty(n, t, Polymer.Settings.suppressBindingNotifications, i)
					}
				},
				_computeFinalAnnotationValue: function (e, t, i, n) {
					if (n.negate && (i = !i), n.isCompound) {
						var r = e.__compoundStorage__[t];
						r[n.compoundIndex] = i, i = r.join("")
					}
					return "attribute" !== n.kind && ("className" === t && (i = this._scopeElementClass(e, i)), ("textContent" === t || "input" == e.localName && "value" == t) && (i = null == i ? "" : i)), i
				},
				_executeStaticEffects: function () {
					this._propertyEffects && this._propertyEffects.__static__ && this._effectEffects("__static__", null, this._propertyEffects.__static__)
				}
			}),
	function () {
		var t = Polymer.Settings.usePolyfillProto,
			i = Boolean(Object.getOwnPropertyDescriptor(document.documentElement, "properties"));
		Polymer.Base._addFeature(
			{
				_setupConfigure: function (e) {
					if (this._config = {}, this._handlers = [], this._aboveConfig = null, e)
						for (var t in e) void 0 !== e[t] && (this._config[t] = e[t])
				},
				_marshalAttributes: function () {
					this._takeAttributesToModel(this._config)
				},
				_attributeChangedImpl: function (e) {
					var t = this._clientsReadied ? this : this._config;
					this._setAttributeToProperty(t, e)
				},
				_configValue: function (e, t) {
					var i = this._propertyInfo[e];
					i && i.readOnly || (this._config[e] = t)
				},
				_beforeClientsReady: function () {
					this._configure()
				},
				_configure: function () {
					this._configureAnnotationReferences(), this._configureInstanceProperties(), this._aboveConfig = this.mixin(
						{}, this._config);
					for (var e = {}, t = 0; t < this.behaviors.length; t++) this._configureProperties(this.behaviors[t].properties, e);
					this._configureProperties(i ? this.__proto__.properties : this.properties, e), this.mixin(e, this._aboveConfig), this._config = e, this._clients && this._clients.length && this._distributeConfig(this._config)
				},
				_configureInstanceProperties: function () {
					for (var e in this._propertyEffects) !t && this.hasOwnProperty(e) && (this._configValue(e, this[e]), delete this[e])
				},
				_configureProperties: function (e, t) {
					for (var i in e) {
						var n = e[i];
						if (void 0 !== n.value) {
							var r = n.value;
							"function" == typeof r && (r = r.call(this, this._config)), t[i] = r
						}
					}
				},
				_distributeConfig: function (e) {
					var t = this._propertyEffects;
					if (t)
						for (var i in e) {
							var n = t[i];
							if (n)
								for (var r, o = 0, s = n.length; o < s && (r = n[o]); o++)
									if ("annotation" === r.kind) {
										var a = this._nodes[r.effect.index],
											c = r.effect.propertyName,
											l = "attribute" == r.effect.kind,
											d = a._propertyEffects && a._propertyEffects[c];
										if (a._configValue && (d || !l)) {
											var h = i === r.effect.value ? e[i] : this._get(r.effect.value, e);
											h = this._computeFinalAnnotationValue(a, c, h, r.effect), l && (h = a.deserialize(this.serialize(h), a._propertyInfo[c].type)), a._configValue(c, h)
										}
									}
						}
				},
				_afterClientsReady: function () {
					this.importPath = this._importPath, this.rootPath = Polymer.rootPath, this._executeStaticEffects(), this._applyConfig(this._config, this._aboveConfig), this._flushHandlers()
				},
				_applyConfig: function (e, t) {
					for (var i in e) void 0 === this[i] && this.__setProperty(i, e[i], i in t)
				},
				_notifyListener: function (e, t) {
					if (!Polymer.Bind._isEventBogus(t, t.target)) {
						var i, n;
						if (t.detail && (i = t.detail.value, n = t.detail.path), this._clientsReadied) return e.call(this, t.target, i, n);
						this._queueHandler([e, t.target, i, n])
					}
				},
				_queueHandler: function (e) {
					this._handlers.push(e)
				},
				_flushHandlers: function () {
					for (var e, t = this._handlers, i = 0, n = t.length; i < n && (e = t[i]); i++) e[0].call(this, e[1], e[2], e[3]);
					this._handlers = []
				}
			})
	}(),
	function () {
		"use strict";
		var a = Polymer.Path;
		Polymer.Base._addFeature(
			{
				notifyPath: function (e, t, i) {
					var n = {},
						r = this._get(e, this, n);
					1 === arguments.length && (t = r), n.path && this._notifyPath(n.path, t, i)
				},
				_notifyPath: function (e, t, i) {
					var n = this._propertySetter(e, t);
					if (n !== t && (n == n || t == t)) return this._pathEffector(e, t), i || this._notifyPathUp(e, t), !0
				},
				_getPathParts: function (e) {
					if (Array.isArray(e)) {
						for (var t = [], i = 0; i < e.length; i++)
							for (var n = e[i].toString().split("."), r = 0; r < n.length; r++) t.push(n[r]);
						return t
					}
					return e.toString().split(".")
				},
				set: function (e, t, i) {
					var n, r = i || this,
						o = this._getPathParts(e),
						s = o[o.length - 1];
					if (1 < o.length) {
						for (var a = 0; a < o.length - 1; a++) {
							var c = o[a];
							if (n && "#" == c[0] ? r = Polymer.Collection.get(n).getItem(c) : (r = r[c], n && parseInt(c, 10) == c && (o[a] = Polymer.Collection.get(n).getKey(r))), !r) return;
							n = Array.isArray(r) ? r : null
						}
						if (n) {
							var l, d, h = Polymer.Collection.get(n);
							"#" == s[0] ? (d = s, l = h.getItem(d), s = n.indexOf(l), h.setItem(d, t)) : parseInt(s, 10) == s && (l = r[s], d = h.getKey(l), o[a] = d, h.setItem(d, t))
						}
						r[s] = t, i || this._notifyPath(o.join("."), t)
					}
					else r[e] = t
				},
				get: function (e, t) {
					return this._get(e, t)
				},
				_get: function (e, t, i) {
					for (var n, r = t || this, o = this._getPathParts(e), s = 0; s < o.length; s++) {
						if (!r) return;
						var a = o[s];
						n && "#" == a[0] ? r = Polymer.Collection.get(n).getItem(a) : (r = r[a], i && n && parseInt(a, 10) == a && (o[s] = Polymer.Collection.get(n).getKey(r))), n = Array.isArray(r) ? r : null
					}
					return i && (i.path = o.join(".")), r
				},
				_pathEffector: function (e, t) {
					var i = a.root(e),
						n = this._propertyEffects && this._propertyEffects[i];
					if (n)
						for (var r, o = 0; o < n.length && (r = n[o]); o++) {
							var s = r.pathFn;
							s && s.call(this, e, t, r.effect)
						}
					this._boundPaths && this._notifyBoundPaths(e, t)
				},
				_annotationPathEffect: function (e, t, i) {
					if (a.matches(i.value, !1, e)) Polymer.Bind._annotationEffect.call(this, e, t, i);
					else if (!i.negate && a.isDescendant(i.value, e)) {
						var n = this._nodes[i.index];
						if (n && n._notifyPath) {
							var r = a.translate(i.value, i.name, e);
							n._notifyPath(r, t, !0)
						}
					}
				},
				_complexObserverPathEffect: function (e, t, i) {
					a.matches(i.trigger.name, i.trigger.wildcard, e) && Polymer.Bind._complexObserverEffect.call(this, e, t, i)
				},
				_computePathEffect: function (e, t, i) {
					a.matches(i.trigger.name, i.trigger.wildcard, e) && Polymer.Bind._computeEffect.call(this, e, t, i)
				},
				_annotatedComputationPathEffect: function (e, t, i) {
					a.matches(i.trigger.name, i.trigger.wildcard, e) && Polymer.Bind._annotatedComputationEffect.call(this, e, t, i)
				},
				linkPaths: function (e, t) {
					this._boundPaths = this._boundPaths ||
						{}, t ? this._boundPaths[e] = t : this.unlinkPaths(e)
				},
				unlinkPaths: function (e) {
					this._boundPaths && delete this._boundPaths[e]
				},
				_notifyBoundPaths: function (e, t) {
					for (var i in this._boundPaths) {
						var n = this._boundPaths[i];
						a.isDescendant(i, e) ? this._notifyPath(a.translate(i, n, e), t) : a.isDescendant(n, e) && this._notifyPath(a.translate(n, i, e), t)
					}
				},
				_notifyPathUp: function (e, t) {
					var i = a.root(e),
						n = Polymer.CaseMap.camelToDashCase(i) + this._EVENT_CHANGED;
					this.fire(n,
						{
							path: e,
							value: t
						},
						{
							bubbles: !1,
							_useCache: Polymer.Settings.eventDataCache || !Polymer.Settings.isIE
						})
				},
				_EVENT_CHANGED: "-changed",
				notifySplices: function (e, t) {
					var i = {},
						n = this._get(e, this, i);
					this._notifySplices(n, i.path, t)
				},
				_notifySplices: function (e, t, i) {
					var n = {
						keySplices: Polymer.Collection.applySplices(e, i),
						indexSplices: i
					},
						r = t + ".splices";
					this._notifyPath(r, n), this._notifyPath(t + ".length", e.length), this.__data__[r] = {
						keySplices: null,
						indexSplices: null
					}
				},
				_notifySplice: function (e, t, i, n, r) {
					this._notifySplices(e, t, [
						{
							index: i,
							addedCount: n,
							removed: r,
							object: e,
							type: "splice"
						}])
				},
				push: function (e) {
					var t = {},
						i = this._get(e, this, t),
						n = Array.prototype.slice.call(arguments, 1),
						r = i.length,
						o = i.push.apply(i, n);
					return n.length && this._notifySplice(i, t.path, r, n.length, []), o
				},
				pop: function (e) {
					var t = {},
						i = this._get(e, this, t),
						n = Boolean(i.length),
						r = Array.prototype.slice.call(arguments, 1),
						o = i.pop.apply(i, r);
					return n && this._notifySplice(i, t.path, i.length, 0, [o]), o
				},
				splice: function (e, t) {
					var i = {},
						n = this._get(e, this, i);
					t = (t = t < 0 ? n.length - Math.floor(-t) : Math.floor(t)) || 0;
					var r = Array.prototype.slice.call(arguments, 1),
						o = n.splice.apply(n, r),
						s = Math.max(r.length - 2, 0);
					return (s || o.length) && this._notifySplice(n, i.path, t, s, o), o
				},
				shift: function (e) {
					var t = {},
						i = this._get(e, this, t),
						n = Boolean(i.length),
						r = Array.prototype.slice.call(arguments, 1),
						o = i.shift.apply(i, r);
					return n && this._notifySplice(i, t.path, 0, 0, [o]), o
				},
				unshift: function (e) {
					var t = {},
						i = this._get(e, this, t),
						n = Array.prototype.slice.call(arguments, 1),
						r = i.unshift.apply(i, n);
					return n.length && this._notifySplice(i, t.path, 0, n.length, []), r
				},
				prepareModelNotifyPath: function (e) {
					this.mixin(e,
						{
							fire: Polymer.Base.fire,
							_getEvent: Polymer.Base._getEvent,
							__eventCache: Polymer.Base.__eventCache,
							notifyPath: Polymer.Base.notifyPath,
							_get: Polymer.Base._get,
							_EVENT_CHANGED: Polymer.Base._EVENT_CHANGED,
							_notifyPath: Polymer.Base._notifyPath,
							_notifyPathUp: Polymer.Base._notifyPathUp,
							_pathEffector: Polymer.Base._pathEffector,
							_annotationPathEffect: Polymer.Base._annotationPathEffect,
							_complexObserverPathEffect: Polymer.Base._complexObserverPathEffect,
							_annotatedComputationPathEffect: Polymer.Base._annotatedComputationPathEffect,
							_computePathEffect: Polymer.Base._computePathEffect,
							_notifyBoundPaths: Polymer.Base._notifyBoundPaths,
							_getPathParts: Polymer.Base._getPathParts
						})
				}
			})
	}(), Polymer.Base._addFeature(
		{
			resolveUrl: function (e) {
				return Polymer.ResolveUrl.resolveUrl(e, this._importPath)
			}
		}), Polymer.CssParse = {
			parse: function (e) {
				return e = this._clean(e), this._parseCss(this._lex(e), e)
			},
			_clean: function (e) {
				return e.replace(this._rx.comments, "").replace(this._rx.port, "")
			},
			_lex: function (e) {
				for (var t = {
					start: 0,
					end: e.length
				}, i = t, n = 0, r = e.length; n < r; n++) switch (e[n]) {
						case this.OPEN_BRACE:
							i.rules || (i.rules = []);
							var o = i;
							i = {
								start: n + 1,
								parent: o,
								previous: o.rules[o.rules.length - 1]
							}, o.rules.push(i);
							break;
						case this.CLOSE_BRACE:
							i.end = n + 1, i = i.parent || t
					}
				return t
			},
			_parseCss: function (e, t) {
				var i = t.substring(e.start, e.end - 1);
				if (e.parsedCssText = e.cssText = i.trim(), e.parent) {
					var n = e.previous ? e.previous.end : e.parent.start;
					i = t.substring(n, e.start - 1), i = (i = (i = this._expandUnicodeEscapes(i)).replace(this._rx.multipleSpaces, " ")).substring(i.lastIndexOf(";") + 1);
					var r = e.parsedSelector = e.selector = i.trim();
					e.atRule = 0 === r.indexOf(this.AT_START), e.atRule ? 0 === r.indexOf(this.MEDIA_START) ? e.type = this.types.MEDIA_RULE : r.match(this._rx.keyframesRule) && (e.type = this.types.KEYFRAMES_RULE, e.keyframesName = e.selector.split(this._rx.multipleSpaces).pop()) : 0 === r.indexOf(this.VAR_START) ? e.type = this.types.MIXIN_RULE : e.type = this.types.STYLE_RULE
				}
				var o = e.rules;
				if (o)
					for (var s, a = 0, c = o.length; a < c && (s = o[a]); a++) this._parseCss(s, t);
				return e
			},
			_expandUnicodeEscapes: function (e) {
				return e.replace(/\\([0-9a-f]{1,6})\s/gi, function () {
					for (var e = arguments[1], t = 6 - e.length; t--;) e = "0" + e;
					return "\\" + e
				})
			},
			stringify: function (e, t, i) {
				i = i || "";
				var n = "";
				if (e.cssText || e.rules) {
					var r = e.rules;
					if (r && !this._hasMixinRules(r))
						for (var o, s = 0, a = r.length; s < a && (o = r[s]); s++) n = this.stringify(o, t, n);
					else n = (n = (n = t ? e.cssText : this.removeCustomProps(e.cssText)).trim()) && "  " + n + "\n"
				}
				return n && (e.selector && (i += e.selector + " " + this.OPEN_BRACE + "\n"), i += n, e.selector && (i += this.CLOSE_BRACE + "\n\n")), i
			},
			_hasMixinRules: function (e) {
				return 0 === e[0].selector.indexOf(this.VAR_START)
			},
			removeCustomProps: function (e) {
				return e = this.removeCustomPropAssignment(e), this.removeCustomPropApply(e)
			},
			removeCustomPropAssignment: function (e) {
				return e.replace(this._rx.customProp, "").replace(this._rx.mixinProp, "")
			},
			removeCustomPropApply: function (e) {
				return e.replace(this._rx.mixinApply, "").replace(this._rx.varApply, "")
			},
			types:
			{
				STYLE_RULE: 1,
				KEYFRAMES_RULE: 7,
				MEDIA_RULE: 4,
				MIXIN_RULE: 1e3
			},
			OPEN_BRACE: "{",
			CLOSE_BRACE: "}",
			_rx:
			{
				comments: /\/\*[^*]*\*+([^\/*][^*]*\*+)*\//gim,
				port: /@import[^;]*;/gim,
				customProp: /(?:^[^;\-\s}]+)?--[^;{}]*?:[^{};]*?(?:[;\n]|$)/gim,
				mixinProp: /(?:^[^;\-\s}]+)?--[^;{}]*?:[^{};]*?{[^}]*?}(?:[;\n]|$)?/gim,
				mixinApply: /@apply\s*\(?[^);]*\)?\s*(?:[;\n]|$)?/gim,
				varApply: /[^;:]*?:[^;]*?var\([^;]*\)(?:[;\n]|$)?/gim,
				keyframesRule: /^@[^\s]*keyframes/,
				multipleSpaces: /\s+/g
			},
			VAR_START: "--",
			MEDIA_START: "@media",
			AT_START: "@"
		}, Polymer.StyleUtil = function () {
			var d = Polymer.Settings;
			return {
				unscopedStyleImports: new WeakMap,
				SHADY_UNSCOPED_ATTR: "shady-unscoped",
				NATIVE_VARIABLES: Polymer.Settings.useNativeCSSProperties,
				MODULE_STYLES_SELECTOR: "style, link[rel=import][type~=css], template",
				INCLUDE_ATTR: "include",
				toCssText: function (e, t) {
					return "string" == typeof e && (e = this.parser.parse(e)), t && this.forEachRule(e, t), this.parser.stringify(e, this.NATIVE_VARIABLES)
				},
				forRulesInStyles: function (e, t, i) {
					if (e)
						for (var n, r = 0, o = e.length; r < o && (n = e[r]); r++) this.forEachRuleInStyle(n, t, i)
				},
				forActiveRulesInStyles: function (e, t, i) {
					if (e)
						for (var n, r = 0, o = e.length; r < o && (n = e[r]); r++) this.forEachRuleInStyle(n, t, i, !0)
				},
				rulesForStyle: function (e) {
					return !e.__cssRules && e.textContent && (e.__cssRules = this.parser.parse(e.textContent)), e.__cssRules
				},
				isKeyframesSelector: function (e) {
					return e.parent && e.parent.type === this.ruleTypes.KEYFRAMES_RULE
				},
				forEachRuleInStyle: function (t, i, n, e) {
					var r, o, s = this.rulesForStyle(t);
					i && (r = function (e) {
						i(e, t)
					}), n && (o = function (e) {
						n(e, t)
					}), this.forEachRule(s, r, o, e)
				},
				forEachRule: function (e, t, i, n) {
					if (e) {
						var r = !1;
						if (n && e.type === this.ruleTypes.MEDIA_RULE) {
							var o = e.selector.match(this.rx.MEDIA_MATCH);
							o && (window.matchMedia(o[1]).matches || (r = !0))
						}
						e.type === this.ruleTypes.STYLE_RULE ? t(e) : i && e.type === this.ruleTypes.KEYFRAMES_RULE ? i(e) : e.type === this.ruleTypes.MIXIN_RULE && (r = !0);
						var s = e.rules;
						if (s && !r)
							for (var a, c = 0, l = s.length; c < l && (a = s[c]); c++) this.forEachRule(a, t, i, n)
					}
				},
				applyCss: function (e, t, i, n) {
					var r = this.createScopeStyle(e, t);
					return this.applyStyle(r, i, n)
				},
				applyStyle: function (e, t, i) {
					t = t || document.head;
					var n = i && i.nextSibling || t.firstChild;
					return this.__lastHeadApplyNode = e, t.insertBefore(e, n)
				},
				createScopeStyle: function (e, t) {
					var i = document.createElement("style");
					return t && i.setAttribute("scope", t), i.textContent = e, i
				},
				__lastHeadApplyNode: null,
				applyStylePlaceHolder: function (e) {
					var t = document.createComment(" Shady DOM styles for " + e + " "),
						i = this.__lastHeadApplyNode ? this.__lastHeadApplyNode.nextSibling : null,
						n = document.head;
					return n.insertBefore(t, i || n.firstChild), this.__lastHeadApplyNode = t
				},
				cssFromModules: function (e, t) {
					for (var i = e.trim().split(/\s+/), n = "", r = 0; r < i.length; r++) n += this.cssFromModule(i[r], t);
					return n
				},
				cssFromModule: function (e, t) {
					var i = Polymer.DomModule.import(e);
					return i && !i._cssText && (i._cssText = this.cssFromElement(i)), !i && t && console.warn("Could not find style data in module named", e), i && i._cssText || ""
				},
				cssFromElement: function (e) {
					for (var t, i = "", n = e.content || e, r = Polymer.TreeApi.arrayCopy(n.querySelectorAll(this.MODULE_STYLES_SELECTOR)), o = 0; o < r.length; o++)
						if ("template" === (t = r[o]).localName) t.hasAttribute("preserve-content") || (i += this.cssFromElement(t));
						else if ("style" === t.localName) {
							var s = t.getAttribute(this.INCLUDE_ATTR);
							s && (i += this.cssFromModules(s, !0)), (t = t.__appliedElement || t).parentNode.removeChild(t);
							var a = this.resolveCss(t.textContent, e.ownerDocument);
							!d.useNativeShadow && t.hasAttribute(this.SHADY_UNSCOPED_ATTR) ? (t.textContent = a, document.head.insertBefore(t, document.head.firstChild)) : i += a
						}
						else if (t.import && t.import.body) {
							var c = this.resolveCss(t.import.body.textContent, t.import);
							if (!d.useNativeShadow && t.hasAttribute(this.SHADY_UNSCOPED_ATTR)) {
								if (!this.unscopedStyleImports.has(t.import)) {
									this.unscopedStyleImports.set(t.import, !0);
									var l = document.createElement("style");
									l.setAttribute(this.SHADY_UNSCOPED_ATTR, ""), l.textContent = c, document.head.insertBefore(l, document.head.firstChild)
								}
							}
							else i += c
						}
					return i
				},
				styleIncludesToTemplate: function (e) {
					for (var t, i = e.content.querySelectorAll("style[include]"), n = 0; n < i.length; n++)(t = i[n]).parentNode.insertBefore(this._includesToFragment(t.getAttribute("include")), t)
				},
				_includesToFragment: function (e) {
					for (var t = e.trim().split(" "), i = document.createDocumentFragment(), n = 0; n < t.length; n++) {
						var r = Polymer.DomModule.import(t[n], "template");
						r && this._addStylesToFragment(i, r.content)
					}
					return i
				},
				_addStylesToFragment: function (e, t) {
					for (var i, n = t.querySelectorAll("style"), r = 0; r < n.length; r++) {
						var o = (i = n[r]).getAttribute("include");
						o && e.appendChild(this._includesToFragment(o)), i.textContent && e.appendChild(i.cloneNode(!0))
					}
				},
				isTargetedBuild: function (e) {
					return d.useNativeShadow ? "shadow" === e : "shady" === e
				},
				cssBuildTypeForModule: function (e) {
					var t = Polymer.DomModule.import(e);
					if (t) return this.getCssBuildType(t)
				},
				getCssBuildType: function (e) {
					return e.getAttribute("css-build")
				},
				_findMatchingParen: function (e, t) {
					for (var i = 0, n = t, r = e.length; n < r; n++) switch (e[n]) {
							case "(":
								i++;
								break;
							case ")":
								if (0 == --i) return n
						}
					return -1
				},
				processVariableAndFallback: function (e, t) {
					var i = e.indexOf("var(");
					if (-1 === i) return t(e, "", "", "");
					var n = this._findMatchingParen(e, i + 3),
						r = e.substring(i + 4, n),
						o = e.substring(0, i),
						s = this.processVariableAndFallback(e.substring(n + 1), t),
						a = r.indexOf(",");
					return -1 === a ? t(o, r.trim(), "", s) : t(o, r.substring(0, a).trim(), r.substring(a + 1).trim(), s)
				},
				rx:
				{
					VAR_ASSIGN: /(?:^|[;\s{]\s*)(--[\w-]*?)\s*:\s*(?:([^;{]*)|{([^}]*)})(?:(?=[;\s}])|$)/gi,
					MIXIN_MATCH: /(?:^|\W+)@apply\s*\(?([^);\n]*)\)?/gi,
					VAR_CONSUMED: /(--[\w-]+)\s*([:,;)]|$)/gi,
					ANIMATION_MATCH: /(animation\s*:)|(animation-name\s*:)/,
					MEDIA_MATCH: /@media[^(]*(\([^)]*\))/,
					IS_VAR: /^--/,
					BRACKETED: /\{[^}]*\}/g,
					HOST_PREFIX: "(?:^|[^.#[:])",
					HOST_SUFFIX: "($|[.:[\\s>+~])"
				},
				resolveCss: Polymer.ResolveUrl.resolveCss,
				parser: Polymer.CssParse,
				ruleTypes: Polymer.CssParse.types
			}
		}(), Polymer.StyleTransformer = function () {
			var u = Polymer.StyleUtil,
				p = Polymer.Settings,
				e = {
					dom: function (e, t, i, n) {
						this._transformDom(e, t || "", i, n)
					},
					_transformDom: function (e, t, i, n) {
						e.setAttribute && this.element(e, t, i, n);
						for (var r = Polymer.dom(e).childNodes, o = 0; o < r.length; o++) this._transformDom(r[o], t, i, n)
					},
					element: function (e, t, i, n) {
						if (i) n ? e.removeAttribute(o) : e.setAttribute(o, t);
						else if (t)
							if (e.classList) n ? (e.classList.remove(o), e.classList.remove(t)) : (e.classList.add(o), e.classList.add(t));
							else if (e.getAttribute) {
								var r = e.getAttribute(g);
								n ? r && e.setAttribute(g, r.replace(o, "").replace(t, "")) : e.setAttribute(g, (r ? r + " " : "") + o + " " + t)
							}
					},
					elementStyles: function (e, t) {
						var i, n = e._styles,
							r = "",
							o = e.__cssBuild,
							s = p.useNativeShadow || "shady" === o;
						if (s) {
							var a = this;
							i = function (e) {
								e.selector = a._slottedToContent(e.selector), e.selector = e.selector.replace(f, ":host > *"), e.selector = a._dirShadowTransform(e.selector), t && t(e)
							}
						}
						for (var c, l = 0, d = n.length; l < d && (c = n[l]); l++) {
							var h = u.rulesForStyle(c);
							r += s ? u.toCssText(h, i) : this.css(h, e.is, e.extends, t, e._scopeCssViaAttr) + "\n\n"
						}
						return r.trim()
					},
					css: function (e, t, i, n, r) {
						var o = this._calcHostScope(t, i);
						t = this._calcElementScope(t, r);
						var s = this;
						return u.toCssText(e, function (e) {
							e.isScoped || (s.rule(e, t, o), e.isScoped = !0), n && n(e, t, o)
						})
					},
					_calcElementScope: function (e, t) {
						return e ? t ? v + e + _ : a + e : ""
					},
					_calcHostScope: function (e, t) {
						return t ? "[is=" + e + "]" : e
					},
					rule: function (e, t, i) {
						this._transformRule(e, this._transformComplexSelector, t, i)
					},
					_transformRule: function (e, t, i, n) {
						e.selector = e.transformedSelector = this._transformRuleCss(e, t, i, n)
					},
					_splitSelectorList: function (e) {
						for (var t = [], i = "", n = 0; 0 <= n && n < e.length; n++)
							if ("(" === e[n]) {
								var r = u._findMatchingParen(e, n);
								i += e.slice(n, r + 1), n = r
							}
							else e[n] === d ? (t.push(i), i = "") : i += e[n];
						return i && t.push(i), 0 === t.length && t.push(e), t
					},
					_transformRuleCss: function (e, t, i, n) {
						var r = this._splitSelectorList(e.selector);
						if (!u.isKeyframesSelector(e))
							for (var o, s = 0, a = r.length; s < a && (o = r[s]); s++) r[s] = t.call(this, o, i, n);
						return r.join(d)
					},
					_ensureScopedDir: function (e) {
						var t = e.match(E);
						return t && "" === t[1] && t[0].length === e.length && (e = "*" + e), e
					},
					_additionalDirSelectors: function (e, t, i) {
						return e && t ? d + (i = i || "") + " " + e + " " + t : ""
					},
					_transformComplexSelector: function (e, r, o) {
						var s = !1,
							a = !1,
							c = !1,
							l = this;
						return e = e.trim(), e = (e = (e = this._slottedToContent(e)).replace(f, ":host > *")).replace(b, h + " $1"), e = (e = this._ensureScopedDir(e)).replace(i, function (e, t, i) {
							if (s) i = i.replace(m, " ");
							else {
								var n = l._transformCompoundSelector(i, t, r, o);
								s = s || n.stop, a = a || n.hostContext, c = c || n.dir, t = n.combinator, i = n.value
							}
							return t + i
						}), a && (e = e.replace(n, function (e, t, i, n) {
							var r = t + i + " " + o + n + d + " " + t + o + i + n;
							return c && (r += l._additionalDirSelectors(i, n, o)), r
						})), e
					},
					_transformDir: function (e) {
						return e = (e = e.replace(w, R)).replace(E, T)
					},
					_transformCompoundSelector: function (e, t, i, n) {
						var r, o = e.search(m),
							s = !1,
							a = !1;
						return e.match(E) && (e = this._transformDir(e), a = !0), 0 <= e.indexOf(c) ? s = !0 : 0 <= e.indexOf(h) ? e = this._transformHostSelector(e, n) : 0 !== o && (e = i ? this._transformSimpleSelector(e, i) : e), 0 <= e.indexOf(l) && (t = ""), 0 <= o && (e = e.replace(m, " "), r = !0),
						{
							value: e,
							combinator: t,
							stop: r,
							hostContext: s,
							dir: a
						}
					},
					_transformSimpleSelector: function (e, t) {
						var i = e.split(y);
						return i[0] += t, i.join(y)
					},
					_transformHostSelector: function (e, n) {
						var t = e.match(s),
							i = t && t[2].trim() || "";
						return i ? i[0].match(r) ? e.replace(s, function (e, t, i) {
							return n + i
						}) : i.split(r)[0] === n ? i : C : e.replace(h, n)
					},
					documentRule: function (e) {
						e.selector = e.parsedSelector, this.normalizeRootSelector(e), p.useNativeShadow || this._transformRule(e, this._transformDocumentSelector)
					},
					normalizeRootSelector: function (e) {
						e.selector = e.selector.replace(f, "html");
						var t = this._splitSelectorList(e.selector);
						t = t.filter(function (e) {
							return !e.match(P)
						}), e.selector = t.join(d)
					},
					_transformDocumentSelector: function (e) {
						return this._transformComplexSelector(e, t)
					},
					_slottedToContent: function (e) {
						return e.replace(S, l + "> $1")
					},
					_dirShadowTransform: function (e) {
						return e.match(/:dir\(/) ? this._splitSelectorList(e).map(function (e) {
							e = this._ensureScopedDir(e), e = this._transformDir(e);
							var t = n.exec(e);
							return t && (e += this._additionalDirSelectors(t[2], t[3], "")), e
						}, this).join(d) : e
					},
					SCOPE_NAME: "style-scope"
				},
				o = e.SCOPE_NAME,
				t = ":not([" + o + "]):not(." + o + ")",
				d = ",",
				i = /(^|[\s>+~]+)((?:\[.+?\]|[^\s>+~=\[])+)/g,
				r = /[[.:#*]/,
				h = ":host",
				f = ":root",
				s = /(:host)(?:\(((?:\([^)(]*\)|[^)(]*)+?)\))/,
				c = ":host-context",
				n = /(.*)(?::host-context)(?:\(((?:\([^)(]*\)|[^)(]*)+?)\))(.*)/,
				l = "::content",
				m = /::content|::shadow|\/deep\//,
				a = ".",
				v = "[" + o + "~=",
				_ = "]",
				y = ":",
				g = "class",
				b = new RegExp("^(" + l + ")"),
				C = "should_not_match",
				S = /(?:::slotted)(?:\(((?:\([^)(]*\)|[^)(]*)+?)\))/g,
				P = /:host(?:\s*>\s*\*)?/,
				E = /(.*):dir\((ltr|rtl)\)/,
				T = ':host-context([dir="$2"]) $1',
				w = /:host\(:dir\((rtl|ltr)\)\)/g,
				R = ':host-context([dir="$1"])';
			return e
		}(), Polymer.StyleExtends = function () {
			var i = Polymer.StyleUtil;
			return {
				hasExtends: function (e) {
					return Boolean(e.match(this.rx.EXTEND))
				},
				transform: function (e) {
					var t = i.rulesForStyle(e),
						r = this;
					return i.forEachRule(t, function (e) {
						if (r._mapRuleOntoParent(e), e.parent)
							for (var t; t = r.rx.EXTEND.exec(e.cssText);) {
								var i = t[1],
									n = r._findExtendor(i, e);
								n && r._extendRule(e, n)
							}
						e.cssText = e.cssText.replace(r.rx.EXTEND, "")
					}), i.toCssText(t, function (e) {
						e.selector.match(r.rx.STRIP) && (e.cssText = "")
					}, !0)
				},
				_mapRuleOntoParent: function (e) {
					if (e.parent) {
						for (var t = e.parent.map || (e.parent.map = {}), i = e.selector.split(","), n = 0; n < i.length; n++) t[i[n].trim()] = e;
						return t
					}
				},
				_findExtendor: function (e, t) {
					return t.parent && t.parent.map && t.parent.map[e] || this._findExtendor(e, t.parent)
				},
				_extendRule: function (t, e) {
					t.parent !== e.parent && this._cloneAndAddRuleToParent(e, t.parent), t.extends = t.extends || [], t.extends.push(e), e.selector = e.selector.replace(this.rx.STRIP, ""), e.selector = (e.selector && e.selector + ",\n") + t.selector, e.extends && e.extends.forEach(function (e) {
						this._extendRule(t, e)
					}, this)
				},
				_cloneAndAddRuleToParent: function (e, t) {
					(e = Object.create(e)).parent = t, e.extends && (e.extends = e.extends.slice()), t.rules.push(e)
				},
				rx:
				{
					EXTEND: /@extends\(([^)]*)\)\s*?;/gim,
					STRIP: /%[^,]*$/
				}
			}
		}(), Polymer.ApplyShim = function () {
			"use strict";
			var f = Polymer.StyleUtil,
				d = f.rx.MIXIN_MATCH,
				i = f.rx.VAR_ASSIGN,
				n = /var\(\s*(--[^,]*),\s*(--[^)]*)\)/g,
				c = /;\s*/m,
				h = /^\s*(initial)|(inherit)\s*$/,
				m = "_-_",
				r = {};

			function v(e, t) {
				e = e.trim(), r[e] = {
					properties: t,
					dependants:
						{}
				}
			}

			function _(e) {
				return e = e.trim(), r[e]
			}

			function y(e) {
				for (var t, i, n, r, o, s, a, c = e.split(";"), l = {}, d = 0; d < c.length; d++)(n = c[d]) && 1 < (r = n.split(":")).length && (t = r[0].trim(), o = t, s = r.slice(1).join(":"), void 0, (a = h.exec(s)) && (s = a[1] ? b._getInitialValueForProperty(o) : "apply-shim-inherit"), i = s, l[t] = i);
				return l
			}

			function o(e, t, i, n) {
				if (i && f.processVariableAndFallback(i, function (e, t) {
					t && _(t) && (n = "@apply " + t + ";")
				}), !n) return e;
				var r = g(n),
					o = e.slice(0, e.indexOf("--")),
					s = y(r),
					a = s,
					c = _(t),
					l = c && c.properties;
				l ? (a = Object.create(l), a = Polymer.Base.mixin(a, s)) : v(t, a);
				var d, h, u = [],
					p = !1;
				for (d in a) void 0 === (h = s[d]) && (h = "initial"), !l || d in l || (p = !0), u.push(t + m + d + ": " + h);
				return p && function (e) {
					var t = b.__currentElementProto,
						i = t && t.is;
					for (var n in e.dependants) n !== i && (e.dependants[n].__applyShimInvalid = !0)
				}(c), c && (c.properties = a), i && (o = e + ";" + o), o + u.join("; ") + ";"
			}

			function s(e, t, i) {
				return "var(" + t + ",var(" + i + "))"
			}

			function u(e, t) {
				var i = [],
					n = _(e = e.replace(c, ""));
				if (n || (v(e,
					{}), n = _(e)), n) {
					var r, o, s, a = b.__currentElementProto;
					for (r in a && (n.dependants[a.is] = a), n.properties) s = t && t[r], o = [r, ": var(", e, m, r], s && o.push(",", s), o.push(")"), i.push(o.join(""))
				}
				return i.join("; ")
			}

			function g(e) {
				for (var t; t = d.exec(e);) {
					var i = t[0],
						n = t[1],
						r = t.index,
						o = r + i.indexOf("@apply"),
						s = r + i.length,
						a = e.slice(0, o),
						c = e.slice(s),
						l = u(n, y(a));
					e = [a, l, c].join(""), d.lastIndex = r + l.length
				}
				return e
			}
			var b = {
				_measureElement: null,
				_map: r,
				_separator: m,
				transform: function (e, t) {
					this.__currentElementProto = t, f.forRulesInStyles(e, this._boundFindDefinitions), f.forRulesInStyles(e, this._boundFindApplications), t && (t.__applyShimInvalid = !1), this.__currentElementProto = null
				},
				_findDefinitions: function (e) {
					var t = e.parsedCssText;
					t = (t = t.replace(n, s)).replace(i, o), e.cssText = t, ":root" === e.selector && (e.selector = ":host > *")
				},
				_findApplications: function (e) {
					e.cssText = g(e.cssText)
				},
				transformRule: function (e) {
					this._findDefinitions(e), this._findApplications(e)
				},
				_getInitialValueForProperty: function (e) {
					return this._measureElement || (this._measureElement = document.createElement("meta"), this._measureElement.style.all = "initial", document.head.appendChild(this._measureElement)), window.getComputedStyle(this._measureElement).getPropertyValue(e)
				}
			};
			return b._boundTransformRule = b.transformRule.bind(b), b._boundFindDefinitions = b._findDefinitions.bind(b), b._boundFindApplications = b._findApplications.bind(b), b
		}(),
	function () {
		var t = Polymer.Base._prepElement,
			n = Polymer.Settings.useNativeShadow,
			c = Polymer.StyleUtil,
			i = Polymer.StyleTransformer,
			l = Polymer.StyleExtends,
			r = Polymer.ApplyShim,
			o = Polymer.Settings;
		Polymer.Base._addFeature(
			{
				_prepElement: function (e) {
					this._encapsulateStyle && "shady" !== this.__cssBuild && i.element(e, this.is, this._scopeCssViaAttr), t.call(this, e)
				},
				_prepStyles: function () {
					void 0 === this._encapsulateStyle && (this._encapsulateStyle = !n), n || (this._scopeStyle = c.applyStylePlaceHolder(this.is)), this.__cssBuild = c.cssBuildTypeForModule(this.is)
				},
				_prepShimStyles: function () {
					if (this._template) {
						var e = c.isTargetedBuild(this.__cssBuild);
						if (o.useNativeCSSProperties && "shadow" === this.__cssBuild && e) return void (o.preserveStyleIncludes && c.styleIncludesToTemplate(this._template));
						this._styles = this._styles || this._collectStyles(), o.useNativeCSSProperties && !this.__cssBuild && r.transform(this._styles, this);
						var t = o.useNativeCSSProperties && e ? this._styles.length && this._styles[0].textContent.trim() : i.elementStyles(this);
						this._prepStyleProperties(), !this._needsStyleProperties() && t && c.applyCss(t, this.is, n ? this._template.content : null, this._scopeStyle)
					}
					else this._styles = []
				},
				_collectStyles: function () {
					var e = [],
						t = "",
						i = this.styleModules;
					if (i)
						for (var n, r = 0, o = i.length; r < o && (n = i[r]); r++) t += c.cssFromModule(n);
					t += c.cssFromModule(this.is);
					var s = this._template && this._template.parentNode;
					if (!this._template || s && s.id.toLowerCase() === this.is || (t += c.cssFromElement(this._template)), t) {
						var a = document.createElement("style");
						a.textContent = t, l.hasExtends(a.textContent) && (t = l.transform(a)), e.push(a)
					}
					return e
				},
				_elementAdd: function (e) {
					this._encapsulateStyle && (e.__styleScoped ? e.__styleScoped = !1 : i.dom(e, this.is, this._scopeCssViaAttr))
				},
				_elementRemove: function (e) {
					this._encapsulateStyle && i.dom(e, this.is, this._scopeCssViaAttr, !0)
				},
				scopeSubtree: function (e, t) {
					if (!n) {
						function r(e) {
							if (e.nodeType === Node.ELEMENT_NODE) {
								var t = e.getAttribute("class");
								e.setAttribute("class", o._scopeElementClass(e, t));
								for (var i, n = e.querySelectorAll("*"), r = 0; r < n.length && (i = n[r]); r++) t = i.getAttribute("class"), i.setAttribute("class", o._scopeElementClass(i, t))
							}
						}
						var o = this;
						if (r(e), t) {
							var i = new MutationObserver(function (e) {
								for (var t, i = 0; i < e.length && (t = e[i]); i++)
									if (t.addedNodes)
										for (var n = 0; n < t.addedNodes.length; n++) r(t.addedNodes[n])
							});
							return i.observe(e,
								{
									childList: !0,
									subtree: !0
								}), i
						}
					}
				}
			})
	}(), Polymer.StyleProperties = function () {
		"use strict";
		var a = Polymer.DomApi.matchesSelector,
			l = Polymer.StyleUtil,
			p = Polymer.StyleTransformer,
			s = navigator.userAgent.match("Trident"),
			d = Polymer.Settings;
		return {
			decorateStyles: function (e, n) {
				var t = this,
					r = {},
					i = [],
					o = 0,
					s = p._calcHostScope(n.is, n.extends);
				l.forRulesInStyles(e, function (i, e) {
					t.decorateRule(i), i.index = o++, t.whenHostOrRootRule(n, i, e, function (e) {
						if (i.parent.type === l.ruleTypes.MEDIA_RULE && (n.__notStyleScopeCacheable = !0), e.isHost) {
							var t = e.selector.split(" ").some(function (e) {
								return 0 === e.indexOf(s) && e.length !== s.length
							});
							n.__notStyleScopeCacheable = n.__notStyleScopeCacheable || t
						}
					}), t.collectPropertiesInCssText(i.propertyInfo.cssText, r)
				}, function (e) {
					i.push(e)
				}), e._keyframes = i;
				var a = [];
				for (var c in r) a.push(c);
				return a
			},
			decorateRule: function (e) {
				if (e.propertyInfo) return e.propertyInfo;
				var t = {},
					i = {};
				return this.collectProperties(e, i) && (t.properties = i, e.rules = null), t.cssText = this.collectCssText(e), e.propertyInfo = t
			},
			collectProperties: function (e, t) {
				var i = e.propertyInfo;
				if (!i) {
					for (var n, r, o, s = this.rx.VAR_ASSIGN, a = e.parsedCssText; n = s.exec(a);) "inherit" !== (r = (n[2] || n[3]).trim()) && (t[n[1].trim()] = r), o = !0;
					return o
				}
				if (i.properties) return Polymer.Base.mixin(t, i.properties), !0
			},
			collectCssText: function (e) {
				return this.collectConsumingCssText(e.parsedCssText)
			},
			collectConsumingCssText: function (e) {
				return e.replace(this.rx.BRACKETED, "").replace(this.rx.VAR_ASSIGN, "")
			},
			collectPropertiesInCssText: function (e, t) {
				for (var i; i = this.rx.VAR_CONSUMED.exec(e);) {
					var n = i[1];
					":" !== i[2] && (t[n] = !0)
				}
			},
			reify: function (e) {
				for (var t, i = Object.getOwnPropertyNames(e), n = 0; n < i.length; n++) e[t = i[n]] = this.valueForProperty(e[t], e)
			},
			valueForProperty: function (e, o) {
				if (e)
					if (0 <= e.indexOf(";")) e = this.valueForProperties(e, o);
					else {
						var s = this;
						e = l.processVariableAndFallback(e, function (e, t, i, n) {
							var r = s.valueForProperty(o[t], o);
							return r && "initial" !== r ? "apply-shim-inherit" === r && (r = "inherit") : r = s.valueForProperty(o[i] || i, o) || i, e + (r || "") + n
						})
					} return e && e.trim() || ""
			},
			valueForProperties: function (e, t) {
				for (var i, n, r = e.split(";"), o = 0; o < r.length; o++)
					if (i = r[o]) {
						if (this.rx.MIXIN_MATCH.lastIndex = 0, n = this.rx.MIXIN_MATCH.exec(i)) i = this.valueForProperty(t[n[1]], t);
						else {
							var s = i.indexOf(":");
							if (-1 !== s) {
								var a = i.substring(s);
								a = a.trim(), a = this.valueForProperty(a, t) || a, i = i.substring(0, s) + a
							}
						}
						r[o] = i && i.lastIndexOf(";") === i.length - 1 ? i.slice(0, -1) : i || ""
					} return r.join(";")
			},
			applyProperties: function (e, t) {
				var i = "";
				e.propertyInfo || this.decorateRule(e), e.propertyInfo.cssText && (i = this.valueForProperties(e.propertyInfo.cssText, t)), e.cssText = i
			},
			applyKeyframeTransforms: function (e, t) {
				var i = e.cssText,
					n = e.cssText;
				if (null == e.hasAnimations && (e.hasAnimations = this.rx.ANIMATION_MATCH.test(i)), e.hasAnimations)
					if (null == e.keyframeNamesToTransform)
						for (var r in e.keyframeNamesToTransform = [], t) i !== (n = (0, t[r])(i)) && (i = n, e.keyframeNamesToTransform.push(r));
					else {
						for (var o = 0; o < e.keyframeNamesToTransform.length; ++o) i = (0, t[e.keyframeNamesToTransform[o]])(i);
						n = i
					} e.cssText = n
			},
			propertyDataFromStyles: function (e, i) {
				var n = {},
					r = this,
					o = [];
				return l.forActiveRulesInStyles(e, function (e) {
					e.propertyInfo || r.decorateRule(e);
					var t = e.transformedSelector || e.parsedSelector;
					i && e.propertyInfo.properties && t && a.call(i, t) && (r.collectProperties(e, n), function (e, t) {
						var i = parseInt(e / 32),
							n = 1 << e % 32;
						t[i] = (t[i] || 0) | n
					}(e.index, o))
				}),
				{
					properties: n,
					key: o
				}
			},
			_rootSelector: /:root|:host\s*>\s*\*/,
			_checkRoot: function (e, t) {
				return Boolean(t.match(this._rootSelector)) || "html" === e && -1 < t.indexOf("html")
			},
			whenHostOrRootRule: function (e, t, i, n) {
				if (t.propertyInfo || self.decorateRule(t), t.propertyInfo.properties) {
					var r = e.is ? p._calcHostScope(e.is, e.extends) : "html",
						o = t.parsedSelector,
						s = this._checkRoot(r, o),
						a = !s && 0 === o.indexOf(":host");
					if ("shady" === (e.__cssBuild || i.__cssBuild) && (a = !(s = o === r + " > *." + r || -1 < o.indexOf("html")) && 0 === o.indexOf(r)), s || a) {
						var c = r;
						a && (d.useNativeShadow && !t.transformedSelector && (t.transformedSelector = p._transformRuleCss(t, p._transformComplexSelector, e.is, r)), c = t.transformedSelector || t.parsedSelector), s && "html" === r && (c = t.transformedSelector || t.parsedSelector), n(
							{
								selector: c,
								isHost: a,
								isRoot: s
							})
					}
				}
			},
			hostAndRootPropertiesForScope: function (n) {
				var r = {},
					o = {},
					s = this;
				return l.forActiveRulesInStyles(n._styles, function (i, e) {
					s.whenHostOrRootRule(n, i, e, function (e) {
						var t = n._element || n;
						a.call(t, e.selector) && (e.isHost ? s.collectProperties(i, r) : s.collectProperties(i, o))
					})
				}),
				{
					rootProps: o,
					hostProps: r
				}
			},
			transformStyles: function (t, i, n) {
				var r = this,
					o = p._calcHostScope(t.is, t.extends),
					e = t.extends ? "\\" + o.slice(0, -1) + "\\]" : o,
					s = new RegExp(this.rx.HOST_PREFIX + e + this.rx.HOST_SUFFIX),
					a = this._elementKeyframeTransforms(t, n);
				return p.elementStyles(t, function (e) {
					r.applyProperties(e, i), d.useNativeShadow || Polymer.StyleUtil.isKeyframesSelector(e) || !e.cssText || (r.applyKeyframeTransforms(e, a), r._scopeSelector(e, s, o, t._scopeCssViaAttr, n))
				})
			},
			_elementKeyframeTransforms: function (e, t) {
				var i = e._styles._keyframes,
					n = {};
				if (!d.useNativeShadow && i)
					for (var r = 0, o = i[r]; r < i.length; o = i[++r]) this._scopeKeyframes(o, t), n[o.keyframesName] = this._keyframesRuleTransformer(o);
				return n
			},
			_keyframesRuleTransformer: function (t) {
				return function (e) {
					return e.replace(t.keyframesNameRx, t.transformedKeyframesName)
				}
			},
			_scopeKeyframes: function (e, t) {
				e.keyframesNameRx = new RegExp("\\b" + e.keyframesName + "(?!\\B|-)", "g"), e.transformedKeyframesName = e.keyframesName + "-" + t, e.transformedSelector = e.transformedSelector || e.selector, e.selector = e.transformedSelector.replace(e.keyframesName, e.transformedKeyframesName)
			},
			_hasDirOrHostContext: function (e) {
				return /:host-context|:dir/.test(e)
			},
			_scopeSelector: function (e, t, i, n, r) {
				e.transformedSelector = e.transformedSelector || e.selector;
				for (var o, s = e.transformedSelector, a = p._calcElementScope(r, n), c = p._calcElementScope(i, n), l = s.split(","), d = this._hasDirOrHostContext(e.parsedSelector), h = 0, u = l.length; h < u && (o = l[h]); h++) l[h] = o.match(t) ? o.replace(i, a) : d ? o.replace(c, a + " " + c) : a + " " + o;
				e.selector = l.join(",")
			},
			applyElementScopeSelector: function (e, t, i, n) {
				var r = n ? e.getAttribute(p.SCOPE_NAME) : e.getAttribute("class") || "",
					o = i ? r.replace(i, t) : (r ? r + " " : "") + this.XSCOPE_NAME + " " + t;
				r !== o && (n ? e.setAttribute(p.SCOPE_NAME, o) : e.setAttribute("class", o))
			},
			applyElementStyle: function (e, t, i, n) {
				var r = n ? n.textContent || "" : this.transformStyles(e, t, i),
					o = e._customStyle;
				return o && !d.useNativeShadow && o !== n && (o._useCount--, o._useCount <= 0 && o.parentNode && o.parentNode.removeChild(o)), d.useNativeShadow ? e._customStyle ? (e._customStyle.textContent = r, n = e._customStyle) : r && (n = l.applyCss(r, i, e.root, e._scopeStyle)) : n ? n.parentNode || (s && -1 < r.indexOf("@media") && (n.textContent = r), l.applyStyle(n, null, e._scopeStyle)) : r && (n = l.applyCss(r, i, null, e._scopeStyle)), n && (n._useCount = n._useCount || 0, e._customStyle != n && n._useCount++, e._customStyle = n), n
			},
			mixinCustomStyle: function (e, t) {
				var i;
				for (var n in t) !(i = t[n]) && 0 !== i || (e[n] = i)
			},
			updateNativeStyleProperties: function (e, t) {
				var i = e.__customStyleProperties;
				if (i)
					for (var n = 0; n < i.length; n++) e.style.removeProperty(i[n]);
				var r = [];
				for (var o in t) null !== t[o] && (e.style.setProperty(o, t[o]), r.push(o));
				e.__customStyleProperties = r
			},
			rx: l.rx,
			XSCOPE_NAME: "x-scope"
		}
	}(), Polymer.StyleCache = function () {
		this.cache = {}
	}, Polymer.StyleCache.prototype = {
		MAX: 100,
		store: function (e, t, i, n) {
			t.keyValues = i, t.styles = n;
			var r = this.cache[e] = this.cache[e] || [];
			r.push(t), r.length > this.MAX && r.shift()
		},
		retrieve: function (e, t, i) {
			var n = this.cache[e];
			if (n)
				for (var r, o = n.length - 1; 0 <= o; o--)
					if (i === (r = n[o]).styles && this._objectsEqual(t, r.keyValues)) return r
		},
		clear: function () {
			this.cache = {}
		},
		_objectsEqual: function (e, t) {
			var i, n;
			for (var r in e)
				if (i = e[r], n = t[r], !("object" == typeof i && i ? this._objectsStrictlyEqual(i, n) : i === n)) return !1;
			return !Array.isArray(e) || e.length === t.length
		},
		_objectsStrictlyEqual: function (e, t) {
			return this._objectsEqual(e, t) && this._objectsEqual(t, e)
		}
	}, Polymer.StyleDefaults = function () {
		var n = Polymer.StyleProperties,
			e = Polymer.StyleCache,
			r = Polymer.Settings.useNativeCSSProperties;
		return {
			_styles: [],
			_properties: null,
			customStyle:
				{},
			_styleCache: new e,
			_element: Polymer.DomApi.wrap(document.documentElement),
			addStyle: function (e) {
				this._styles.push(e), this._properties = null
			},
			get _styleProperties() {
				return this._properties || (n.decorateStyles(this._styles, this), this._styles._scopeStyleProperties = null, this._properties = n.hostAndRootPropertiesForScope(this).rootProps, n.mixinCustomStyle(this._properties, this.customStyle), n.reify(this._properties)), this._properties
			},
			hasStyleProperties: function () {
				return Boolean(this._properties)
			},
			_needsStyleProperties: function () { },
			_computeStyleProperties: function () {
				return this._styleProperties
			},
			updateStyles: function (e) {
				this._properties = null, e && Polymer.Base.mixin(this.customStyle, e), this._styleCache.clear();
				for (var t, i = 0; i < this._styles.length; i++)(t = (t = this._styles[i]).__importElement || t)._apply();
				r && n.updateNativeStyleProperties(document.documentElement, this.customStyle)
			}
		}
	}(),
	function () {
		"use strict";
		var r = Polymer.Base.serializeValueToAttribute,
			a = Polymer.StyleProperties,
			n = Polymer.StyleTransformer,
			i = Polymer.StyleDefaults,
			c = Polymer.Settings.useNativeShadow,
			t = Polymer.Settings.useNativeCSSProperties;
		Polymer.Base._addFeature(
			{
				_prepStyleProperties: function () {
					t || (this._ownStylePropertyNames = this._styles && this._styles.length ? a.decorateStyles(this._styles, this) : null)
				},
				customStyle: null,
				getComputedStyleValue: function (e) {
					return t || this._styleProperties || this._computeStyleProperties(), !t && this._styleProperties && this._styleProperties[e] || getComputedStyle(this).getPropertyValue(e)
				},
				_setupStyleProperties: function () {
					this.customStyle = {}, this._styleCache = null, this._styleProperties = null, this._scopeSelector = null, this._ownStyleProperties = null, this._customStyle = null
				},
				_needsStyleProperties: function () {
					return Boolean(!t && this._ownStylePropertyNames && this._ownStylePropertyNames.length)
				},
				_validateApplyShim: function () {
					if (this.__applyShimInvalid) {
						Polymer.ApplyShim.transform(this._styles, this.__proto__);
						var e = n.elementStyles(this);
						if (c) {
							var t = this._template.content.querySelector("style");
							t && (t.textContent = e)
						}
						else {
							var i = this._scopeStyle && this._scopeStyle.nextSibling;
							i && (i.textContent = e)
						}
					}
				},
				_beforeAttached: function () {
					this._scopeSelector && !this.__stylePropertiesInvalid || !this._needsStyleProperties() || (this.__stylePropertiesInvalid = !1, this._updateStyleProperties())
				},
				_findStyleHost: function () {
					for (var e, t = this; e = Polymer.dom(t).getOwnerRoot();) {
						if (Polymer.isInstance(e.host)) return e.host;
						t = e.host
					}
					return i
				},
				_updateStyleProperties: function () {
					var e, t = this._findStyleHost();
					t._styleProperties || t._computeStyleProperties(), t._styleCache || (t._styleCache = new Polymer.StyleCache);
					var i = a.propertyDataFromStyles(t._styles, this),
						n = !this.__notStyleScopeCacheable;
					n && (i.key.customStyle = this.customStyle, e = t._styleCache.retrieve(this.is, i.key, this._styles));
					var r = Boolean(e);
					r ? this._styleProperties = e._styleProperties : this._computeStyleProperties(i.properties), this._computeOwnStyleProperties(), r || (e = l.retrieve(this.is, this._ownStyleProperties, this._styles));
					var o = Boolean(e) && !r,
						s = this._applyStyleProperties(e);
					r || (e = {
						style: s = s && c ? s.cloneNode(!0) : s,
						_scopeSelector: this._scopeSelector,
						_styleProperties: this._styleProperties
					}, n && (i.key.customStyle = {}, this.mixin(i.key.customStyle, this.customStyle), t._styleCache.store(this.is, e, i.key, this._styles)), o || l.store(this.is, Object.create(e), this._ownStyleProperties, this._styles))
				},
				_computeStyleProperties: function (e) {
					var t = this._findStyleHost();
					t._styleProperties || t._computeStyleProperties();
					var i = Object.create(t._styleProperties),
						n = a.hostAndRootPropertiesForScope(this);
					this.mixin(i, n.hostProps), e = e || a.propertyDataFromStyles(t._styles, this).properties, this.mixin(i, e), this.mixin(i, n.rootProps), a.mixinCustomStyle(i, this.customStyle), a.reify(i), this._styleProperties = i
				},
				_computeOwnStyleProperties: function () {
					for (var e, t = {}, i = 0; i < this._ownStylePropertyNames.length; i++) t[e = this._ownStylePropertyNames[i]] = this._styleProperties[e];
					this._ownStyleProperties = t
				},
				_scopeCount: 0,
				_applyStyleProperties: function (e) {
					var t = this._scopeSelector;
					this._scopeSelector = e ? e._scopeSelector : this.is + "-" + this.__proto__._scopeCount++;
					var i = a.applyElementStyle(this, this._styleProperties, this._scopeSelector, e && e.style);
					return c || a.applyElementScopeSelector(this, this._scopeSelector, t, this._scopeCssViaAttr), i
				},
				serializeValueToAttribute: function (e, t, i) {
					if (i = i || this, "class" === t && !c) {
						var n = i === this ? this.domHost || this.dataHost : this;
						n && (e = n._scopeElementClass(i, e))
					}
					i = this.shadyRoot && this.shadyRoot._hasDistributed ? Polymer.dom(i) : i, r.call(this, e, t, i)
				},
				_scopeElementClass: function (e, t) {
					return c || this._scopeCssViaAttr || (t = (t ? t + " " : "") + o + " " + this.is + (e._scopeSelector ? " " + s + " " + e._scopeSelector : "")), t
				},
				updateStyles: function (e) {
					e && this.mixin(this.customStyle, e), t ? a.updateNativeStyleProperties(this, this.customStyle) : (this.isAttached ? this._needsStyleProperties() ? this._updateStyleProperties() : this._styleProperties = null : this.__stylePropertiesInvalid = !0, this._styleCache && this._styleCache.clear(), this._updateRootStyles())
				},
				_updateRootStyles: function (e) {
					e = e || this.root;
					for (var t, i = Polymer.dom(e)._query(function (e) {
						return e.shadyRoot || e.shadowRoot
					}), n = 0, r = i.length; n < r && (t = i[n]); n++) t.updateStyles && t.updateStyles()
				}
			}), Polymer.updateStyles = function (e) {
				i.updateStyles(e), Polymer.Base._updateRootStyles(document)
			};
		var l = new Polymer.StyleCache;
		Polymer.customStyleCache = l;
		var o = n.SCOPE_NAME,
			s = a.XSCOPE_NAME
	}(), Polymer.Base._addFeature(
		{
			_registerFeatures: function () {
				this._prepIs(), this.factoryImpl && this._prepConstructor(), this._prepStyles()
			},
			_finishRegisterFeatures: function () {
				this._prepTemplate(), this._prepShimStyles(), this._prepAnnotations(), this._prepEffects(), this._prepBehaviors(), this._prepPropertyInfo(), this._prepBindings(), this._prepShady()
			},
			_prepBehavior: function (e) {
				this._addPropertyEffects(e.properties), this._addComplexObserverEffects(e.observers), this._addHostAttributes(e.hostAttributes)
			},
			_initFeatures: function () {
				this._setupGestures(), this._setupConfigure(this.__data__), this._setupStyleProperties(), this._setupDebouncers(), this._setupShady(), this._registerHost(), this._template && (this._validateApplyShim(), this._poolContent(), this._beginHosting(), this._stampTemplate(), this._endHosting(), this._marshalAnnotationReferences()), this._marshalInstanceEffects(), this._marshalBehaviors(), this._marshalHostAttributes(), this._marshalAttributes(), this._tryReady()
			},
			_marshalBehavior: function (e) {
				e.listeners && this._listenListeners(e.listeners)
			}
		}),
	function () {
		var e, n = Polymer.StyleProperties,
			a = Polymer.StyleUtil,
			r = Polymer.CssParse,
			o = Polymer.StyleDefaults,
			c = Polymer.StyleTransformer,
			l = Polymer.ApplyShim,
			t = Polymer.Debounce,
			d = Polymer.Settings;
		Polymer(
			{
				is: "custom-style",
				extends: "style",
				_template: null,
				properties:
				{
					include: String
				},
				ready: function () {
					this.__appliedElement = this.__appliedElement || this, this.__cssBuild = a.getCssBuildType(this), this.__appliedElement !== this && (this.__appliedElement.__cssBuild = this.__cssBuild), this.ownerDocument !== window.document && this.__appliedElement === this && document.head.appendChild(this), this._tryApply()
				},
				attached: function () {
					this._tryApply()
				},
				_tryApply: function () {
					if (!this._appliesToDocument && this.parentNode && "dom-module" !== this.parentNode.localName) {
						this._appliesToDocument = !0;
						var e = this.__appliedElement;
						if (d.useNativeCSSProperties || (this.__needsUpdateStyles = o.hasStyleProperties(), o.addStyle(e)), e.textContent || this.include) this._apply(!0);
						else {
							var t = this,
								i = new MutationObserver(function () {
									i.disconnect(), t._apply(!0)
								});
							i.observe(e,
								{
									childList: !0
								})
						}
					}
				},
				_updateStyles: function () {
					Polymer.updateStyles()
				},
				_apply: function (e) {
					var t = this.__appliedElement;
					if (this.include && (t.textContent = a.cssFromModules(this.include, !0) + t.textContent), t.textContent) {
						var i = this.__cssBuild,
							n = a.isTargetedBuild(i);
						if (!d.useNativeCSSProperties || !n) {
							var r = a.rulesForStyle(t);
							if (n || (a.forEachRule(r, function (e) {
								c.documentRule(e)
							}), d.useNativeCSSProperties && !i && l.transform([t])), d.useNativeCSSProperties) t.textContent = a.toCssText(r);
							else {
								function o() {
									s._flushCustomProperties()
								}
								var s = this;
								e ? Polymer.RenderStatus.whenReady(o) : o()
							}
						}
					}
				},
				_flushCustomProperties: function () {
					this.__needsUpdateStyles ? (this.__needsUpdateStyles = !1, e = t(e, this._updateStyles)) : this._applyCustomProperties()
				},
				_applyCustomProperties: function () {
					var e = this.__appliedElement;
					this._computeStyleProperties();
					var i = this._styleProperties,
						t = a.rulesForStyle(e);
					t && (e.textContent = a.toCssText(t, function (e) {
						var t = e.cssText = e.parsedCssText;
						e.propertyInfo && e.propertyInfo.cssText && (t = r.removeCustomPropAssignment(t), e.cssText = n.valueForProperties(t, i))
					}))
				}
			})
	}(), Polymer.Templatizer = {
		properties:
		{
			__hideTemplateChildren__:
			{
				observer: "_showHideChildren"
			}
		},
		_instanceProps: Polymer.nob,
		_parentPropPrefix: "_parent_",
		templatize: function (e) {
			if (Polymer.Settings.strictTemplatePolicy && !this._getRootDataHost()) throw new Error("strictTemplatePolicy: template owner not trusted");
			if ((this._templatized = e)._content || (e._content = e.content), e._content._ctor) return this.ctor = e._content._ctor, void this._prepParentProperties(this.ctor.prototype, e);
			var t = Object.create(Polymer.Base);
			this._customPrepAnnotations(t, e), this._prepParentProperties(t, e), t._prepEffects(), this._customPrepEffects(t), t._prepBehaviors(), t._prepPropertyInfo(), t._prepBindings(), t._notifyPathUp = this._notifyPathUpImpl, t._scopeElementClass = this._scopeElementClassImpl, t.listen = this._listenImpl, t._showHideChildren = this._showHideChildrenImpl, t.__setPropertyOrig = this.__setProperty, t.__setProperty = this.__setPropertyImpl;

			function i(e, t) {
				n.call(this, e, t)
			}
			var n = this._constructorImpl;
			(i.prototype = t).constructor = i, e._content._ctor = i, this.ctor = i
		},
		_getRootDataHost: function () {
			return this.dataHost && this.dataHost._rootDataHost || this.dataHost
		},
		_showHideChildrenImpl: function (e) {
			for (var t = this._children, i = 0; i < t.length; i++) {
				var n = t[i];
				Boolean(e) != Boolean(n.__hideTemplateChildren__) && (n.nodeType === Node.TEXT_NODE ? e ? (n.__polymerTextContent__ = n.textContent, n.textContent = "") : n.textContent = n.__polymerTextContent__ : n.style && (e ? (n.__polymerDisplay__ = n.style.display, n.style.display = "none") : n.style.display = n.__polymerDisplay__)), n.__hideTemplateChildren__ = e
			}
		},
		__setPropertyImpl: function (e, t, i, n) {
			n && n.__hideTemplateChildren__ && "textContent" == e && (e = "__polymerTextContent__"), this.__setPropertyOrig(e, t, i, n)
		},
		_debounceTemplate: function (e) {
			Polymer.dom.addDebouncer(this.debounce("_debounceTemplate", e))
		},
		_flushTemplates: function () {
			Polymer.dom.flush()
		},
		_customPrepEffects: function (e) {
			var t = e._parentProps;
			for (var i in t) e._addPropertyEffect(i, "function", this._createHostPropEffector(i));
			for (i in this._instanceProps) e._addPropertyEffect(i, "function", this._createInstancePropEffector(i))
		},
		_customPrepAnnotations: function (e, t) {
			var i = (e._template = document.createElement("template"))._content = t._content;
			if (!i._notes) {
				var n = e._rootDataHost;
				n && (Polymer.Annotations.prepElement = function () {
					n._prepElement()
				}), i._notes = Polymer.Annotations.parseAnnotations(t), Polymer.Annotations.prepElement = null, this._processAnnotations(i._notes)
			}
			e._notes = i._notes, e._parentProps = i._parentProps
		},
		_prepParentProperties: function (e, t) {
			var i = this._parentProps = e._parentProps;
			if (this._forwardParentProp && i) {
				var n, r = e._parentPropProto;
				if (!r) {
					for (n in this._instanceProps) delete i[n];
					for (n in r = e._parentPropProto = Object.create(null), t != this && (Polymer.Bind.prepareModel(r), Polymer.Base.prepareModelNotifyPath(r)), i) {
						var o = this._parentPropPrefix + n,
							s = [
								{
									kind: "function",
									effect: this._createForwardPropEffector(n),
									fn: Polymer.Bind._functionEffect
								},
								{
									kind: "notify",
									fn: Polymer.Bind._notifyEffect,
									effect:
									{
										event: Polymer.CaseMap.camelToDashCase(o) + "-changed"
									}
								}];
						r._propertyEffects = r._propertyEffects ||
							{}, r._propertyEffects[o] = s, Polymer.Bind._createAccessors(r, o, s)
					}
				}
				var a = this;
				t != this && (Polymer.Bind.prepareInstance(t), t._forwardParentProp = function (e, t) {
					a._forwardParentProp(e, t)
				}), this._extendTemplate(t, r), t._pathEffector = function (e, t, i) {
					return a._pathEffectorImpl(e, t, i)
				}
			}
		},
		_createForwardPropEffector: function (i) {
			return function (e, t) {
				this._forwardParentProp(i, t)
			}
		},
		_createHostPropEffector: function (i) {
			var n = this._parentPropPrefix;
			return function (e, t) {
				this.dataHost._templatized[n + i] = t
			}
		},
		_createInstancePropEffector: function (r) {
			return function (e, t, i, n) {
				n || this.dataHost._forwardInstanceProp(this, r, t)
			}
		},
		_extendTemplate: function (e, t) {
			var i = Object.getOwnPropertyNames(t);
			t._propertySetter && (e._propertySetter = t._propertySetter);
			for (var n, r = 0; r < i.length && (n = i[r]); r++) {
				var o = e[n];
				if (o && "_propertyEffects" == n) {
					var s = Polymer.Base.mixin(
						{}, o);
					e._propertyEffects = Polymer.Base.mixin(s, t._propertyEffects)
				}
				else {
					var a = Object.getOwnPropertyDescriptor(t, n);
					Object.defineProperty(e, n, a), void 0 !== o && e._propertySetter(n, o)
				}
			}
		},
		_showHideChildren: function (e) { },
		_forwardInstancePath: function (e, t, i) { },
		_forwardInstanceProp: function (e, t, i) { },
		_notifyPathUpImpl: function (e, t) {
			var i = this.dataHost,
				n = Polymer.Path.root(e);
			i._forwardInstancePath.call(i, this, e, t), n in i._parentProps && i._templatized._notifyPath(i._parentPropPrefix + e, t)
		},
		_pathEffectorImpl: function (e, t, i) {
			if (this._forwardParentPath && 0 === e.indexOf(this._parentPropPrefix)) {
				var n = e.substring(this._parentPropPrefix.length);
				Polymer.Path.root(n) in this._parentProps && this._forwardParentPath(n, t)
			}
			Polymer.Base._pathEffector.call(this._templatized, e, t, i)
		},
		_constructorImpl: function (e, t) {
			this._rootDataHost = t._getRootDataHost(), this._setupConfigure(e), this._registerHost(t), this._beginHosting(), this.root = this.instanceTemplate(this._template), this.root.__noContent = !this._notes._hasContent, this.root.__styleScoped = !0, this._endHosting(), this._marshalAnnotatedNodes(), this._marshalInstanceEffects(), this._marshalAnnotatedListeners();
			for (var i = [], n = this.root.firstChild; n; n = n.nextSibling) i.push(n), n._templateInstance = this;
			this._children = i, t.__hideTemplateChildren__ && this._showHideChildren(!0), this._tryReady()
		},
		_listenImpl: function (e, t, i) {
			var n = this,
				r = this._rootDataHost,
				o = r._createEventHandler(e, t, i);
			r._listen(e, t, function (e) {
				e.model = n, o(e)
			})
		},
		_scopeElementClassImpl: function (e, t) {
			var i = this._rootDataHost;
			return i ? i._scopeElementClass(e, t) : t
		},
		stamp: function (e) {
			if (e = e ||
				{}, this._parentProps) {
				var t = this._templatized;
				for (var i in this._parentProps) void 0 === e[i] && (e[i] = t[this._parentPropPrefix + i])
			}
			return new this.ctor(e, this)
		},
		modelForElement: function (e) {
			for (var t; e;)
				if (t = e._templateInstance) {
					if (t.dataHost == this) return t;
					e = t.dataHost
				}
				else e = e.parentNode
		}
	}, Polymer(
		{
			is: "dom-template",
			extends: "template",
			_template: null,
			behaviors: [Polymer.Templatizer],
			ready: function () {
				this.templatize(this)
			}
		}), Polymer._collections = new WeakMap, Polymer.Collection = function (e) {
			Polymer._collections.set(e, this), this.userArray = e, this.store = e.slice(), this.initMap()
		}, Polymer.Collection.prototype = {
			constructor: Polymer.Collection,
			initMap: function () {
				for (var e = this.omap = new WeakMap, t = this.pmap = {}, i = this.store, n = 0; n < i.length; n++) {
					var r = i[n];
					r && "object" == typeof r ? e.set(r, n) : t[r] = n
				}
			},
			add: function (e) {
				var t = this.store.push(e) - 1;
				return e && "object" == typeof e ? this.omap.set(e, t) : this.pmap[e] = t, "#" + t
			},
			removeKey: function (e) {
				(e = this._parseKey(e)) && (this._removeFromMap(this.store[e]), delete this.store[e])
			},
			_removeFromMap: function (e) {
				e && "object" == typeof e ? this.omap.delete(e) : delete this.pmap[e]
			},
			remove: function (e) {
				var t = this.getKey(e);
				return this.removeKey(t), t
			},
			getKey: function (e) {
				var t;
				if (null != (t = e && "object" == typeof e ? this.omap.get(e) : this.pmap[e])) return "#" + t
			},
			getKeys: function () {
				return Object.keys(this.store).map(function (e) {
					return "#" + e
				})
			},
			_parseKey: function (e) {
				if (e && "#" == e[0]) return e.slice(1)
			},
			setItem: function (e, t) {
				if (e = this._parseKey(e)) {
					var i = this.store[e];
					i && this._removeFromMap(i), t && "object" == typeof t ? this.omap.set(t, e) : this.pmap[t] = e, this.store[e] = t
				}
			},
			getItem: function (e) {
				if (e = this._parseKey(e)) return this.store[e]
			},
			getItems: function () {
				var e = [],
					t = this.store;
				for (var i in t) e.push(t[i]);
				return e
			},
			_applySplices: function (e) {
				for (var t, i, n = {}, r = 0; r < e.length && (i = e[r]); r++) {
					i.addedKeys = [];
					for (var o = 0; o < i.removed.length; o++) n[t = this.getKey(i.removed[o])] = n[t] ? null : -1;
					for (o = 0; o < i.addedCount; o++) {
						var s = this.userArray[i.index + o];
						n[t = void 0 === (t = this.getKey(s)) ? this.add(s) : t] = n[t] ? null : 1, i.addedKeys.push(t)
					}
				}
				var a = [],
					c = [];
				for (t in n) n[t] < 0 && (this.removeKey(t), a.push(t)), 0 < n[t] && c.push(t);
				return [
					{
						removed: a,
						added: c
					}]
			}
		}, Polymer.Collection.get = function (e) {
			return Polymer._collections.get(e) || new Polymer.Collection(e)
		}, Polymer.Collection.applySplices = function (e, t) {
			var i = Polymer._collections.get(e);
			return i ? i._applySplices(t) : null
		}, Polymer(
			{
				is: "dom-repeat",
				extends: "template",
				_template: null,
				properties:
				{
					items:
					{
						type: Array
					},
					as:
					{
						type: String,
						value: "item"
					},
					indexAs:
					{
						type: String,
						value: "index"
					},
					sort:
					{
						type: Function,
						observer: "_sortChanged"
					},
					filter:
					{
						type: Function,
						observer: "_filterChanged"
					},
					observe:
					{
						type: String,
						observer: "_observeChanged"
					},
					delay: Number,
					renderedItemCount:
					{
						type: Number,
						notify: !Polymer.Settings.suppressTemplateNotifications,
						readOnly: !0
					},
					initialCount:
					{
						type: Number,
						observer: "_initializeChunking"
					},
					targetFramerate:
					{
						type: Number,
						value: 20
					},
					notifyDomChange:
					{
						type: Boolean
					},
					_targetFrameTime:
					{
						type: Number,
						computed: "_computeFrameTime(targetFramerate)"
					}
				},
				behaviors: [Polymer.Templatizer],
				observers: ["_itemsChanged(items.*)"],
				created: function () {
					this._instances = [], this._pool = [], this._limit = 1 / 0;
					var e = this;
					this._boundRenderChunk = function () {
						e._renderChunk()
					}
				},
				detached: function () {
					this.__isDetached = !0;
					for (var e = 0; e < this._instances.length; e++) this._detachInstance(e)
				},
				attached: function () {
					if (this.__isDetached) {
						var e;
						this.__isDetached = !1;
						var t = Polymer.dom(this).parentNode;
						t.localName == this.is ? (e = t, t = Polymer.dom(t).parentNode) : e = this;
						for (var i = Polymer.dom(t), n = 0; n < this._instances.length; n++) this._attachInstance(n, i, e)
					}
				},
				ready: function () {
					this._instanceProps = {
						__key__: !0
					}, this._instanceProps[this.as] = !0, this._instanceProps[this.indexAs] = !0, this.ctor || this.templatize(this)
				},
				_sortChanged: function (e) {
					var t = this._getRootDataHost();
					this._sortFn = e && ("function" == typeof e ? e : function () {
						return t[e].apply(t, arguments)
					}), this._needFullRefresh = !0, this.items && this._debounceTemplate(this._render)
				},
				_filterChanged: function (e) {
					var t = this._getRootDataHost();
					this._filterFn = e && ("function" == typeof e ? e : function () {
						return t[e].apply(t, arguments)
					}), this._needFullRefresh = !0, this.items && this._debounceTemplate(this._render)
				},
				_computeFrameTime: function (e) {
					return Math.ceil(1e3 / e)
				},
				_initializeChunking: function () {
					this.initialCount && (this._limit = this.initialCount, this._chunkCount = this.initialCount, this._lastChunkTime = performance.now())
				},
				_tryRenderChunk: function () {
					this.items && this._limit < this.items.length && this.debounce("renderChunk", this._requestRenderChunk)
				},
				_requestRenderChunk: function () {
					requestAnimationFrame(this._boundRenderChunk)
				},
				_renderChunk: function () {
					var e = performance.now(),
						t = this._targetFrameTime / (e - this._lastChunkTime);
					this._chunkCount = Math.round(this._chunkCount * t) || 1, this._limit += this._chunkCount, this._lastChunkTime = e, this._debounceTemplate(this._render)
				},
				_observeChanged: function () {
					this._observePaths = this.observe && this.observe.replace(".*", ".").split(" ")
				},
				_itemsChanged: function (e) {
					if ("items" == e.path) Array.isArray(this.items) ? this.collection = Polymer.Collection.get(this.items) : this.items ? this._error(this._logf("dom-repeat", "expected array for `items`, found", this.items)) : this.collection = null, this._keySplices = [], this._indexSplices = [], this._needFullRefresh = !0, this._initializeChunking(), this._debounceTemplate(this._render);
					else if ("items.splices" == e.path) this._keySplices = this._keySplices.concat(e.value.keySplices), this._indexSplices = this._indexSplices.concat(e.value.indexSplices), this._debounceTemplate(this._render);
					else {
						var t = e.path.slice(6);
						this._forwardItemPath(t, e.value), this._checkObservedPaths(t)
					}
				},
				_checkObservedPaths: function (e) {
					if (this._observePaths) {
						e = e.substring(e.indexOf(".") + 1);
						for (var t = this._observePaths, i = 0; i < t.length; i++)
							if (0 === e.indexOf(t[i])) return this._needFullRefresh = !0, void (this.delay ? this.debounce("render", this._render, this.delay) : this._debounceTemplate(this._render))
					}
				},
				render: function () {
					this._needFullRefresh = !0, this._debounceTemplate(this._render), this._flushTemplates()
				},
				_render: function () {
					if (this.ctor) {
						this._needFullRefresh ? (this._applyFullRefresh(), this._needFullRefresh = !1) : this._keySplices.length && (this._sortFn ? this._applySplicesUserSort(this._keySplices) : this._filterFn ? this._applyFullRefresh() : this._applySplicesArrayOrder(this._indexSplices)), this._keySplices = [], this._indexSplices = [];
						for (var e = this._keyToInstIdx = {}, t = this._instances.length - 1; 0 <= t; t--) {
							var i = this._instances[t];
							i.isPlaceholder && t < this._limit ? i = this._insertInstance(t, i.__key__) : !i.isPlaceholder && t >= this._limit && (i = this._downgradeInstance(t, i.__key__)), e[i.__key__] = t, i.isPlaceholder || i.__setProperty(this.indexAs, t, !0)
						}
						this._pool.length = 0, this._setRenderedItemCount(this._instances.length), Polymer.Settings.suppressTemplateNotifications && !this.notifyDomChange || this.fire("dom-change"), this._tryRenderChunk()
					}
				},
				_applyFullRefresh: function () {
					var e, i = this.collection;
					if (this._sortFn) e = i ? i.getKeys() : [];
					else {
						e = [];
						var t = this.items;
						if (t)
							for (var n = 0; n < t.length; n++) e.push(i.getKey(t[n]))
					}
					var r = this;
					for (this._filterFn && (e = e.filter(function (e) {
						return r._filterFn(i.getItem(e))
					})), this._sortFn && e.sort(function (e, t) {
						return r._sortFn(i.getItem(e), i.getItem(t))
					}), n = 0; n < e.length; n++) {
						var o = e[n],
							s = this._instances[n];
						s ? (s.__key__ = o, !s.isPlaceholder && n < this._limit && s.__setProperty(this.as, i.getItem(o), !0)) : n < this._limit ? this._insertInstance(n, o) : this._insertPlaceholder(n, o)
					}
					for (var a = this._instances.length - 1; n <= a; a--) this._detachAndRemoveInstance(a)
				},
				_numericSort: function (e, t) {
					return e - t
				},
				_applySplicesUserSort: function (e) {
					for (var t, i, n = this.collection, r = {}, o = 0; o < e.length && (i = e[o]); o++) {
						for (var s = 0; s < i.removed.length; s++) r[t = i.removed[s]] = r[t] ? null : -1;
						for (s = 0; s < i.added.length; s++) r[t = i.added[s]] = r[t] ? null : 1
					}
					var a = [],
						c = [];
					for (t in r) - 1 === r[t] && a.push(this._keyToInstIdx[t]), 1 === r[t] && c.push(t);
					if (a.length)
						for (a.sort(this._numericSort), o = a.length - 1; 0 <= o; o--) {
							var l = a[o];
							void 0 !== l && this._detachAndRemoveInstance(l)
						}
					var d = this;
					if (c.length) {
						this._filterFn && (c = c.filter(function (e) {
							return d._filterFn(n.getItem(e))
						})), c.sort(function (e, t) {
							return d._sortFn(n.getItem(e), n.getItem(t))
						});
						var h = 0;
						for (o = 0; o < c.length; o++) h = this._insertRowUserSort(h, c[o])
					}
				},
				_insertRowUserSort: function (e, t) {
					for (var i = this.collection, n = i.getItem(t), r = this._instances.length - 1, o = -1; e <= r;) {
						var s = e + r >> 1,
							a = this._instances[s].__key__,
							c = this._sortFn(i.getItem(a), n);
						if (c < 0) e = 1 + s;
						else {
							if (!(0 < c)) {
								o = s;
								break
							}
							r = s - 1
						}
					}
					return o < 0 && (o = r + 1), this._insertPlaceholder(o, t), o
				},
				_applySplicesArrayOrder: function (e) {
					for (var t, i = 0; i < e.length && (t = e[i]); i++) {
						for (var n = 0; n < t.removed.length; n++) this._detachAndRemoveInstance(t.index);
						for (n = 0; n < t.addedKeys.length; n++) this._insertPlaceholder(t.index + n, t.addedKeys[n])
					}
				},
				_detachInstance: function (e) {
					var t = this._instances[e];
					if (!t.isPlaceholder) {
						for (var i = 0; i < t._children.length; i++) {
							var n = t._children[i];
							Polymer.dom(t.root).appendChild(n)
						}
						return t
					}
				},
				_attachInstance: function (e, t, i) {
					var n = this._instances[e];
					n.isPlaceholder || t.insertBefore(n.root, i)
				},
				_detachAndRemoveInstance: function (e) {
					var t = this._detachInstance(e);
					t && this._pool.push(t), this._instances.splice(e, 1)
				},
				_insertPlaceholder: function (e, t) {
					this._instances.splice(e, 0,
						{
							isPlaceholder: !0,
							__key__: t
						})
				},
				_stampInstance: function (e, t) {
					var i = {
						__key__: t
					};
					return i[this.as] = this.collection.getItem(t), i[this.indexAs] = e, this.stamp(i)
				},
				_insertInstance: function (e, t) {
					var i = this._pool.pop();
					i ? (i.__setProperty(this.as, this.collection.getItem(t), !0), i.__setProperty("__key__", t, !0)) : i = this._stampInstance(e, t);
					var n = this._instances[e + 1],
						r = n && !n.isPlaceholder ? n._children[0] : this,
						o = Polymer.dom(this).parentNode;
					return o.localName == this.is && (r == this && (r = o), o = Polymer.dom(o).parentNode), Polymer.dom(o).insertBefore(i.root, r), this._instances[e] = i
				},
				_downgradeInstance: function (e, t) {
					var i = this._detachInstance(e);
					return i && this._pool.push(i), i = {
						isPlaceholder: !0,
						__key__: t
					}, this._instances[e] = i
				},
				_showHideChildren: function (e) {
					for (var t = 0; t < this._instances.length; t++) this._instances[t].isPlaceholder || this._instances[t]._showHideChildren(e)
				},
				_forwardInstanceProp: function (e, t, i) {
					var n;
					t == this.as && (n = this._sortFn || this._filterFn ? this.items.indexOf(this.collection.getItem(e.__key__)) : e[this.indexAs], this.set("items." + n, i))
				},
				_forwardInstancePath: function (e, t, i) {
					0 === t.indexOf(this.as + ".") && this._notifyPath("items." + e.__key__ + "." + t.slice(this.as.length + 1), i)
				},
				_forwardParentProp: function (e, t) {
					for (var i, n = this._instances, r = 0; r < n.length && (i = n[r]); r++) i.isPlaceholder || i.__setProperty(e, t, !0)
				},
				_forwardParentPath: function (e, t) {
					for (var i, n = this._instances, r = 0; r < n.length && (i = n[r]); r++) i.isPlaceholder || i._notifyPath(e, t, !0)
				},
				_forwardItemPath: function (e, t) {
					if (this._keyToInstIdx) {
						var i = e.indexOf("."),
							n = e.substring(0, i < 0 ? e.length : i),
							r = this._keyToInstIdx[n],
							o = this._instances[r];
						o && !o.isPlaceholder && (0 <= i ? (e = this.as + "." + e.substring(i + 1), o._notifyPath(e, t, !0)) : o.__setProperty(this.as, t, !0))
					}
				},
				itemForElement: function (e) {
					var t = this.modelForElement(e);
					return t && t[this.as]
				},
				keyForElement: function (e) {
					var t = this.modelForElement(e);
					return t && t.__key__
				},
				indexForElement: function (e) {
					var t = this.modelForElement(e);
					return t && t[this.indexAs]
				}
			}), Polymer(
				{
					is: "array-selector",
					_template: null,
					properties:
					{
						items:
						{
							type: Array,
							observer: "clearSelection"
						},
						multi:
						{
							type: Boolean,
							value: !1,
							observer: "clearSelection"
						},
						selected:
						{
							type: Object,
							notify: !0
						},
						selectedItem:
						{
							type: Object,
							notify: !0
						},
						toggle:
						{
							type: Boolean,
							value: !1
						}
					},
					clearSelection: function () {
						if (Array.isArray(this.selected))
							for (var e = 0; e < this.selected.length; e++) this.unlinkPaths("selected." + e);
						else this.unlinkPaths("selected"), this.unlinkPaths("selectedItem");
						this.multi ? this.selected && !this.selected.length || (this.selected = [], this._selectedColl = Polymer.Collection.get(this.selected)) : (this.selected = null, this._selectedColl = null), this.selectedItem = null
					},
					isSelected: function (e) {
						return this.multi ? void 0 !== this._selectedColl.getKey(e) : this.selected == e
					},
					deselect: function (e) {
						if (this.multi) {
							if (this.isSelected(e)) {
								var t = this._selectedColl.getKey(e);
								this.arrayDelete("selected", e), this.unlinkPaths("selected." + t)
							}
						}
						else this.selected = null, this.selectedItem = null, this.unlinkPaths("selected"), this.unlinkPaths("selectedItem")
					},
					select: function (e) {
						var t = Polymer.Collection.get(this.items).getKey(e);
						if (this.multi)
							if (this.isSelected(e)) this.toggle && this.deselect(e);
							else {
								this.push("selected", e);
								var i = this._selectedColl.getKey(e);
								this.linkPaths("selected." + i, "items." + t)
							}
						else this.toggle && e == this.selected ? this.deselect() : (this.selected = e, this.selectedItem = e, this.linkPaths("selected", "items." + t), this.linkPaths("selectedItem", "items." + t))
					}
				}), Polymer(
					{
						is: "dom-if",
						extends: "template",
						_template: null,
						properties:
						{
							if:
							{
								type: Boolean,
								value: !1,
								observer: "_queueRender"
							},
							restamp:
							{
								type: Boolean,
								value: !1,
								observer: "_queueRender"
							},
							notifyDomChange:
							{
								type: Boolean
							}
						},
						behaviors: [Polymer.Templatizer],
						_queueRender: function () {
							this._debounceTemplate(this._render)
						},
						detached: function () {
							var e = this.parentNode;
							e && e.localName == this.is && (e = Polymer.dom(e).parentNode), e && (e.nodeType != Node.DOCUMENT_FRAGMENT_NODE || Polymer.Settings.hasShadow && e instanceof ShadowRoot) || this._teardownInstance()
						},
						attached: function () {
							this.if && this.ctor && this.async(this._ensureInstance)
						},
						render: function () {
							this._flushTemplates()
						},
						_render: function () {
							this.if ? (this.ctor || this.templatize(this), this._ensureInstance(), this._showHideChildren()) : this.restamp && this._teardownInstance(), !this.restamp && this._instance && this._showHideChildren(), this.if != this._lastIf && (Polymer.Settings.suppressTemplateNotifications && !this.notifyDomChange || this.fire("dom-change"), this._lastIf = this.if)
						},
						_ensureInstance: function () {
							var e, t = Polymer.dom(this).parentNode;
							if (t && t.localName == this.is ? (e = t, t = Polymer.dom(t).parentNode) : e = this, t)
								if (this._instance) {
									var i = this._instance._children;
									if (i && i.length)
										if (Polymer.dom(e).previousSibling !== i[i.length - 1])
											for (var n, r = 0; r < i.length && (n = i[r]); r++) Polymer.dom(t).insertBefore(n, e)
								}
								else {
									this._instance = this.stamp();
									var o = this._instance.root;
									Polymer.dom(t).insertBefore(o, e)
								}
						},
						_teardownInstance: function () {
							if (this._instance) {
								var e = this._instance._children;
								if (e && e.length) {
									var t = Polymer.dom(Polymer.dom(e[0]).parentNode);
									if (t)
										for (var i, n = 0; n < e.length && (i = e[n]); n++) t.removeChild(i)
								}
								this._instance = null
							}
						},
						_showHideChildren: function () {
							var e = this.__hideTemplateChildren__ || !this.if;
							this._instance && this._instance._showHideChildren(e)
						},
						_forwardParentProp: function (e, t) {
							this._instance && this._instance.__setProperty(e, t, !0)
						},
						_forwardParentPath: function (e, t) {
							this._instance && this._instance._notifyPath(e, t, !0)
						}
					}), Polymer(
						{
							is: "dom-bind",
							properties:
							{
								notifyDomChange:
								{
									type: Boolean
								}
							},
							extends: "template",
							_template: null,
							created: function () {
								if (Polymer.Settings.strictTemplatePolicy) throw new Error("strictTemplatePolicy: dom-bind not allowed");
								var e = this;
								Polymer.RenderStatus.whenReady(function () {
									"loading" == document.readyState ? document.addEventListener("DOMContentLoaded", function () {
										e._markImportsReady()
									}) : e._markImportsReady()
								})
							},
							_ensureReady: function () {
								this._readied || this._readySelf()
							},
							_markImportsReady: function () {
								this._importsReady = !0, this._ensureReady()
							},
							_registerFeatures: function () {
								this._prepConstructor()
							},
							_insertChildren: function () {
								var e, t = Polymer.dom(this).parentNode;
								t.localName == this.is ? (e = t, t = Polymer.dom(t).parentNode) : e = this, Polymer.dom(t).insertBefore(this.root, e)
							},
							_removeChildren: function () {
								if (this._children)
									for (var e = 0; e < this._children.length; e++) this.root.appendChild(this._children[e])
							},
							_initFeatures: function () { },
							_scopeElementClass: function (e, t) {
								return this.dataHost ? this.dataHost._scopeElementClass(e, t) : t
							},
							_configureInstanceProperties: function () { },
							_prepConfigure: function () {
								var e = {};
								for (var t in this._propertyEffects) e[t] = this[t];
								var i = this._setupConfigure;
								this._setupConfigure = function () {
									i.call(this, e)
								}
							},
							attached: function () {
								this._importsReady && this.render()
							},
							detached: function () {
								this._removeChildren()
							},
							render: function () {
								this._ensureReady(), this._children || ((this._template = this)._prepAnnotations(), this._prepEffects(), this._prepBehaviors(), this._prepConfigure(), this._prepBindings(), this._prepPropertyInfo(), Polymer.Base._initFeatures.call(this), this._children = Polymer.TreeApi.arrayCopyChildNodes(this.root)), this._insertChildren(), Polymer.Settings.suppressTemplateNotifications && !this.notifyDomChange || this.fire("dom-change")
							}
						}),
	function () {
		var e = document.createElement("style");
		e.textContent = "[hidden] { display: none !important; }", document.head.appendChild(e)
	}(), Polymer(
		{
			is: "paper-toolbar",
			hostAttributes:
			{
				role: "toolbar"
			},
			properties:
			{
				bottomJustify:
				{
					type: String,
					value: ""
				},
				justify:
				{
					type: String,
					value: ""
				},
				middleJustify:
				{
					type: String,
					value: ""
				}
			},
			attached: function () {
				this._observer = this._observe(this), this._updateAriaLabelledBy()
			},
			detached: function () {
				this._observer && this._observer.disconnect()
			},
			_observe: function (e) {
				var t = new MutationObserver(function () {
					this._updateAriaLabelledBy()
				}.bind(this));
				return t.observe(e,
					{
						childList: !0,
						subtree: !0
					}), t
			},
			_updateAriaLabelledBy: function () {
				for (var e, t = [], i = Polymer.dom(this.root).querySelectorAll("content"), n = 0; e = i[n]; n++)
					for (var r, o = Polymer.dom(e).getDistributedNodes(), s = 0; r = o[s]; s++)
						if (r.classList && r.classList.contains("title"))
							if (r.id) t.push(r.id);
							else {
								var a = "paper-toolbar-label-" + Math.floor(1e4 * Math.random());
								r.id = a, t.push(a)
							} 0 < t.length && this.setAttribute("aria-labelledby", t.join(" "))
			},
			_computeBarExtraClasses: function (e) {
				return e ? e + ("justified" === e ? "" : "-justified") : ""
			}
		}),
	function () {
		var t = {},
			i = {},
			e = null;
		Polymer.IronMeta = Polymer(
			{
				is: "iron-meta",
				properties:
				{
					type:
					{
						type: String,
						value: "default",
						observer: "_typeChanged"
					},
					key:
					{
						type: String,
						observer: "_keyChanged"
					},
					value:
					{
						type: Object,
						notify: !0,
						observer: "_valueChanged"
					},
					self:
					{
						type: Boolean,
						observer: "_selfChanged"
					},
					list:
					{
						type: Array,
						notify: !0
					}
				},
				hostAttributes:
				{
					hidden: !0
				},
				factoryImpl: function (e) {
					if (e)
						for (var t in e) switch (t) {
								case "type":
								case "key":
								case "value":
									this[t] = e[t]
							}
				},
				created: function () {
					this._metaDatas = t, this._metaArrays = i
				},
				_keyChanged: function (e, t) {
					this._resetRegistration(t)
				},
				_valueChanged: function (e) {
					this._resetRegistration(this.key)
				},
				_selfChanged: function (e) {
					e && (this.value = this)
				},
				_typeChanged: function (e) {
					this._unregisterKey(this.key), t[e] || (t[e] = {}), this._metaData = t[e], i[e] || (i[e] = []), this.list = i[e], this._registerKeyValue(this.key, this.value)
				},
				byKey: function (e) {
					return this._metaData && this._metaData[e]
				},
				_resetRegistration: function (e) {
					this._unregisterKey(e), this._registerKeyValue(this.key, this.value)
				},
				_unregisterKey: function (e) {
					this._unregister(e, this._metaData, this.list)
				},
				_registerKeyValue: function (e, t) {
					this._register(e, t, this._metaData, this.list)
				},
				_register: function (e, t, i, n) {
					e && i && void 0 !== t && (i[e] = t, n.push(t))
				},
				_unregister: function (e, t, i) {
					if (e && t && e in t) {
						var n = t[e];
						delete t[e], this.arrayDelete(i, n)
					}
				}
			}), Polymer.IronMeta.getIronMeta = function () {
				return null === e && (e = new Polymer.IronMeta), e
			}, Polymer.IronMetaQuery = Polymer(
				{
					is: "iron-meta-query",
					properties:
					{
						type:
						{
							type: String,
							value: "default",
							observer: "_typeChanged"
						},
						key:
						{
							type: String,
							observer: "_keyChanged"
						},
						value:
						{
							type: Object,
							notify: !0,
							readOnly: !0
						},
						list:
						{
							type: Array,
							notify: !0
						}
					},
					factoryImpl: function (e) {
						if (e)
							for (var t in e) switch (t) {
									case "type":
									case "key":
										this[t] = e[t]
								}
					},
					created: function () {
						this._metaDatas = t, this._metaArrays = i
					},
					_keyChanged: function (e) {
						this._setValue(this._metaData && this._metaData[e])
					},
					_typeChanged: function (e) {
						this._metaData = t[e], this.list = i[e], this.key && this._keyChanged(this.key)
					},
					byKey: function (e) {
						return this._metaData && this._metaData[e]
					}
				})
	}(), Polymer.NeonAnimatableBehavior = {
		properties:
		{
			animationConfig:
			{
				type: Object
			},
			entryAnimation:
			{
				observer: "_entryAnimationChanged",
				type: String
			},
			exitAnimation:
			{
				observer: "_exitAnimationChanged",
				type: String
			}
		},
		_entryAnimationChanged: function () {
			this.animationConfig = this.animationConfig ||
				{}, this.animationConfig.entry = [
					{
						name: this.entryAnimation,
						node: this
					}]
		},
		_exitAnimationChanged: function () {
			this.animationConfig = this.animationConfig ||
				{}, this.animationConfig.exit = [
					{
						name: this.exitAnimation,
						node: this
					}]
		},
		_copyProperties: function (e, t) {
			for (var i in t) e[i] = t[i]
		},
		_cloneConfig: function (e) {
			var t = {
				isClone: !0
			};
			return this._copyProperties(t, e), t
		},
		_getAnimationConfigRecursive: function (e, t, i) {
			var n;
			if (this.animationConfig)
				if (this.animationConfig.value && "function" == typeof this.animationConfig.value) this._warn(this._logf("playAnimation", "Please put 'animationConfig' inside of your components 'properties' object instead of outside of it."));
				else if (n = e ? this.animationConfig[e] : this.animationConfig, Array.isArray(n) || (n = [n]), n)
					for (var r, o = 0; r = n[o]; o++)
						if (r.animatable) r.animatable._getAnimationConfigRecursive(r.type || e, t, i);
						else if (r.id) {
							var s = t[r.id];
							s ? (s.isClone || (t[r.id] = this._cloneConfig(s), s = t[r.id]), this._copyProperties(s, r)) : t[r.id] = r
						}
						else i.push(r)
		},
		getAnimationConfig: function (e) {
			var t = {},
				i = [];
			for (var n in this._getAnimationConfigRecursive(e, t, i), t) i.push(t[n]);
			return i
		}
	}, Polymer.NeonAnimationRunnerBehaviorImpl = {
		_configureAnimations: function (e) {
			var t = [];
			if (0 < e.length)
				for (var i, n = 0; i = e[n]; n++) {
					var r = document.createElement(i.name);
					if (r.isNeonAnimation) {
						var o = null;
						try {
							"function" != typeof (o = r.configure(i)).cancel && (o = document.timeline.play(o))
						}
						catch (e) {
							o = null, console.warn("Couldnt play", "(", i.name, ").", e)
						}
						o && t.push(
							{
								neonAnimation: r,
								config: i,
								animation: o
							})
					}
					else console.warn(this.is + ":", i.name, "not found!")
				}
			return t
		},
		_shouldComplete: function (e) {
			for (var t = !0, i = 0; i < e.length; i++)
				if ("finished" != e[i].animation.playState) {
					t = !1;
					break
				} return t
		},
		_complete: function (e) {
			for (var t = 0; t < e.length; t++) e[t].neonAnimation.complete(e[t].config);
			for (t = 0; t < e.length; t++) e[t].animation.cancel()
		},
		playAnimation: function (e, t) {
			var i = this.getAnimationConfig(e);
			if (i) {
				this._active = this._active ||
					{}, this._active[e] && (this._complete(this._active[e]), delete this._active[e]);
				var n = this._configureAnimations(i);
				if (0 != n.length) {
					this._active[e] = n;
					for (var r = 0; r < n.length; r++) n[r].animation.onfinish = function () {
						this._shouldComplete(n) && (this._complete(n), delete this._active[e], this.fire("neon-animation-finish", t,
							{
								bubbles: !1
							}))
					}.bind(this)
				}
				else this.fire("neon-animation-finish", t,
					{
						bubbles: !1
					})
			}
		},
		cancelAnimation: function () {
			for (var e in this._animations) this._animations[e].cancel();
			this._animations = {}
		}
	}, Polymer.NeonAnimationRunnerBehavior = [Polymer.NeonAnimatableBehavior, Polymer.NeonAnimationRunnerBehaviorImpl], Polymer.IronFitBehavior = {
		properties:
		{
			sizingTarget:
			{
				type: Object,
				value: function () {
					return this
				}
			},
			fitInto:
			{
				type: Object,
				value: window
			},
			noOverlap:
			{
				type: Boolean
			},
			positionTarget:
			{
				type: Element
			},
			horizontalAlign:
			{
				type: String
			},
			verticalAlign:
			{
				type: String
			},
			dynamicAlign:
			{
				type: Boolean
			},
			horizontalOffset:
			{
				type: Number,
				value: 0,
				notify: !0
			},
			verticalOffset:
			{
				type: Number,
				value: 0,
				notify: !0
			},
			autoFitOnAttach:
			{
				type: Boolean,
				value: !1
			},
			_fitInfo:
			{
				type: Object
			}
		},
		get _fitWidth() {
			return this.fitInto === window ? this.fitInto.innerWidth : this.fitInto.getBoundingClientRect().width
		},
		get _fitHeight() {
			return this.fitInto === window ? this.fitInto.innerHeight : this.fitInto.getBoundingClientRect().height
		},
		get _fitLeft() {
			return this.fitInto === window ? 0 : this.fitInto.getBoundingClientRect().left
		},
		get _fitTop() {
			return this.fitInto === window ? 0 : this.fitInto.getBoundingClientRect().top
		},
		get _defaultPositionTarget() {
			var e = Polymer.dom(this).parentNode;
			return e && e.nodeType === Node.DOCUMENT_FRAGMENT_NODE && (e = e.host), e
		},
		get _localeHorizontalAlign() {
			if (this._isRTL) {
				if ("right" === this.horizontalAlign) return "left";
				if ("left" === this.horizontalAlign) return "right"
			}
			return this.horizontalAlign
		},
		attached: function () {
			void 0 === this._isRTL && (this._isRTL = "rtl" == window.getComputedStyle(this).direction), this.positionTarget = this.positionTarget || this._defaultPositionTarget, this.autoFitOnAttach && ("none" === window.getComputedStyle(this).display ? setTimeout(function () {
				this.fit()
			}.bind(this)) : this.fit())
		},
		fit: function () {
			this.position(), this.constrain(), this.center()
		},
		_discoverInfo: function () {
			if (!this._fitInfo) {
				var e = window.getComputedStyle(this),
					t = window.getComputedStyle(this.sizingTarget);
				this._fitInfo = {
					inlineStyle:
					{
						top: this.style.top || "",
						left: this.style.left || "",
						position: this.style.position || ""
					},
					sizerInlineStyle:
					{
						maxWidth: this.sizingTarget.style.maxWidth || "",
						maxHeight: this.sizingTarget.style.maxHeight || "",
						boxSizing: this.sizingTarget.style.boxSizing || ""
					},
					positionedBy:
					{
						vertically: "auto" !== e.top ? "top" : "auto" !== e.bottom ? "bottom" : null,
						horizontally: "auto" !== e.left ? "left" : "auto" !== e.right ? "right" : null
					},
					sizedBy:
					{
						height: "none" !== t.maxHeight,
						width: "none" !== t.maxWidth,
						minWidth: parseInt(t.minWidth, 10) || 0,
						minHeight: parseInt(t.minHeight, 10) || 0
					},
					margin:
					{
						top: parseInt(e.marginTop, 10) || 0,
						right: parseInt(e.marginRight, 10) || 0,
						bottom: parseInt(e.marginBottom, 10) || 0,
						left: parseInt(e.marginLeft, 10) || 0
					}
				}
			}
		},
		resetFit: function () {
			var e = this._fitInfo ||
				{};
			for (var t in e.sizerInlineStyle) this.sizingTarget.style[t] = e.sizerInlineStyle[t];
			for (var t in e.inlineStyle) this.style[t] = e.inlineStyle[t];
			this._fitInfo = null
		},
		refit: function () {
			var e = this.sizingTarget.scrollLeft,
				t = this.sizingTarget.scrollTop;
			this.resetFit(), this.fit(), this.sizingTarget.scrollLeft = e, this.sizingTarget.scrollTop = t
		},
		position: function () {
			if (this.horizontalAlign || this.verticalAlign) {
				this._discoverInfo(), this.style.position = "fixed", this.sizingTarget.style.boxSizing = "border-box", this.style.left = "0px", this.style.top = "0px";
				var e = this.getBoundingClientRect(),
					t = this.__getNormalizedRect(this.positionTarget),
					i = this.__getNormalizedRect(this.fitInto),
					n = this._fitInfo.margin,
					r = {
						width: e.width + n.left + n.right,
						height: e.height + n.top + n.bottom
					},
					o = this.__getPosition(this._localeHorizontalAlign, this.verticalAlign, r, t, i),
					s = o.left + n.left,
					a = o.top + n.top,
					c = Math.min(i.right - n.right, s + e.width),
					l = Math.min(i.bottom - n.bottom, a + e.height);
				s = Math.max(i.left + n.left, Math.min(s, c - this._fitInfo.sizedBy.minWidth)), a = Math.max(i.top + n.top, Math.min(a, l - this._fitInfo.sizedBy.minHeight)), this.sizingTarget.style.maxWidth = Math.max(c - s, this._fitInfo.sizedBy.minWidth) + "px", this.sizingTarget.style.maxHeight = Math.max(l - a, this._fitInfo.sizedBy.minHeight) + "px", this.style.left = s - e.left + "px", this.style.top = a - e.top + "px"
			}
		},
		constrain: function () {
			if (!this.horizontalAlign && !this.verticalAlign) {
				this._discoverInfo();
				var e = this._fitInfo;
				e.positionedBy.vertically || (this.style.position = "fixed", this.style.top = "0px"), e.positionedBy.horizontally || (this.style.position = "fixed", this.style.left = "0px"), this.sizingTarget.style.boxSizing = "border-box";
				var t = this.getBoundingClientRect();
				e.sizedBy.height || this.__sizeDimension(t, e.positionedBy.vertically, "top", "bottom", "Height"), e.sizedBy.width || this.__sizeDimension(t, e.positionedBy.horizontally, "left", "right", "Width")
			}
		},
		_sizeDimension: function (e, t, i, n, r) {
			this.__sizeDimension(e, t, i, n, r)
		},
		__sizeDimension: function (e, t, i, n, r) {
			var o = this._fitInfo,
				s = this.__getNormalizedRect(this.fitInto),
				a = "Width" === r ? s.width : s.height,
				c = t === n,
				l = c ? a - e[n] : e[i],
				d = o.margin[c ? i : n],
				h = "offset" + r,
				u = this[h] - this.sizingTarget[h];
			this.sizingTarget.style["max" + r] = a - d - l - u + "px"
		},
		center: function () {
			if (!this.horizontalAlign && !this.verticalAlign) {
				this._discoverInfo();
				var e = this._fitInfo.positionedBy;
				if (!e.vertically || !e.horizontally) {
					this.style.position = "fixed", e.vertically || (this.style.top = "0px"), e.horizontally || (this.style.left = "0px");
					var t = this.getBoundingClientRect(),
						i = this.__getNormalizedRect(this.fitInto);
					if (!e.vertically) {
						var n = i.top - t.top + (i.height - t.height) / 2;
						this.style.top = n + "px"
					}
					if (!e.horizontally) {
						var r = i.left - t.left + (i.width - t.width) / 2;
						this.style.left = r + "px"
					}
				}
			}
		},
		__getNormalizedRect: function (e) {
			return e === document.documentElement || e === window ?
				{
					top: 0,
					left: 0,
					width: window.innerWidth,
					height: window.innerHeight,
					right: window.innerWidth,
					bottom: window.innerHeight
				} : e.getBoundingClientRect()
		},
		__getCroppedArea: function (e, t, i) {
			var n = Math.min(0, e.top) + Math.min(0, i.bottom - (e.top + t.height)),
				r = Math.min(0, e.left) + Math.min(0, i.right - (e.left + t.width));
			return Math.abs(n) * t.width + Math.abs(r) * t.height
		},
		__getPosition: function (e, t, i, n, r) {
			var o, s = [
				{
					verticalAlign: "top",
					horizontalAlign: "left",
					top: n.top + this.verticalOffset,
					left: n.left + this.horizontalOffset
				},
				{
					verticalAlign: "top",
					horizontalAlign: "right",
					top: n.top + this.verticalOffset,
					left: n.right - i.width - this.horizontalOffset
				},
				{
					verticalAlign: "bottom",
					horizontalAlign: "left",
					top: n.bottom - i.height - this.verticalOffset,
					left: n.left + this.horizontalOffset
				},
				{
					verticalAlign: "bottom",
					horizontalAlign: "right",
					top: n.bottom - i.height - this.verticalOffset,
					left: n.right - i.width - this.horizontalOffset
				}];
			if (this.noOverlap) {
				for (var a = 0, c = s.length; a < c; a++) {
					var l = {};
					for (var d in s[a]) l[d] = s[a][d];
					s.push(l)
				}
				s[0].top = s[1].top += n.height, s[2].top = s[3].top -= n.height, s[4].left = s[6].left += n.width, s[5].left = s[7].left -= n.width
			}
			t = "auto" === t ? null : t, e = "auto" === e ? null : e;
			for (a = 0; a < s.length; a++) {
				var h = s[a];
				if (!this.dynamicAlign && !this.noOverlap && h.verticalAlign === t && h.horizontalAlign === e) {
					o = h;
					break
				}
				var u = !(t && h.verticalAlign !== t || e && h.horizontalAlign !== e);
				if (this.dynamicAlign || u) {
					o = o || h, h.croppedArea = this.__getCroppedArea(h, i, r);
					var p = h.croppedArea - o.croppedArea;
					if ((p < 0 || 0 == p && u) && (o = h), 0 === o.croppedArea && u) break
				}
			}
			return o
		}
	}, Polymer.IronResizableBehavior = {
		properties:
		{
			_parentResizable:
			{
				type: Object,
				observer: "_parentResizableChanged"
			},
			_notifyingDescendant:
			{
				type: Boolean,
				value: !1
			}
		},
		listeners:
		{
			"iron-request-resize-notifications": "_onIronRequestResizeNotifications"
		},
		created: function () {
			this._interestedResizables = [], this._boundNotifyResize = this.notifyResize.bind(this)
		},
		attached: function () {
			this.fire("iron-request-resize-notifications", null,
				{
					node: this,
					bubbles: !0,
					cancelable: !0
				}), this._parentResizable || (window.addEventListener("resize", this._boundNotifyResize), this.notifyResize())
		},
		detached: function () {
			this._parentResizable ? this._parentResizable.stopResizeNotificationsFor(this) : window.removeEventListener("resize", this._boundNotifyResize), this._parentResizable = null
		},
		notifyResize: function () {
			this.isAttached && (this._interestedResizables.forEach(function (e) {
				this.resizerShouldNotify(e) && this._notifyDescendant(e)
			}, this), this._fireResize())
		},
		assignParentResizable: function (e) {
			this._parentResizable = e
		},
		stopResizeNotificationsFor: function (e) {
			var t = this._interestedResizables.indexOf(e); - 1 < t && (this._interestedResizables.splice(t, 1), this.unlisten(e, "iron-resize", "_onDescendantIronResize"))
		},
		resizerShouldNotify: function (e) {
			return !0
		},
		_onDescendantIronResize: function (e) {
			this._notifyingDescendant ? e.stopPropagation() : Polymer.Settings.useShadow || this._fireResize()
		},
		_fireResize: function () {
			this.fire("iron-resize", null,
				{
					node: this,
					bubbles: !1
				})
		},
		_onIronRequestResizeNotifications: function (e) {
			var t = e.path ? e.path[0] : e.target;
			t !== this && (-1 === this._interestedResizables.indexOf(t) && (this._interestedResizables.push(t), this.listen(t, "iron-resize", "_onDescendantIronResize")), t.assignParentResizable(this), this._notifyDescendant(t), e.stopPropagation())
		},
		_parentResizableChanged: function (e) {
			e && window.removeEventListener("resize", this._boundNotifyResize)
		},
		_notifyDescendant: function (e) {
			this.isAttached && (this._notifyingDescendant = !0, e.notifyResize(), this._notifyingDescendant = !1)
		}
	},
	function () {
		"use strict";
		var i = {
			"U+0008": "backspace",
			"U+0009": "tab",
			"U+001B": "esc",
			"U+0020": "space",
			"U+007F": "del"
		},
			n = {
				8: "backspace",
				9: "tab",
				13: "enter",
				27: "esc",
				33: "pageup",
				34: "pagedown",
				35: "end",
				36: "home",
				32: "space",
				37: "left",
				38: "up",
				39: "right",
				40: "down",
				46: "del",
				106: "*"
			},
			o = {
				shift: "shiftKey",
				ctrl: "ctrlKey",
				alt: "altKey",
				meta: "metaKey"
			},
			r = /[a-z0-9*]/,
			s = /U\+/,
			a = /^arrow/,
			c = /^space(bar)?/,
			l = /^escape$/;

		function d(e, t) {
			var i = "";
			if (e) {
				var n = e.toLowerCase();
				" " === n || c.test(n) ? i = "space" : l.test(n) ? i = "esc" : 1 == n.length ? t && !r.test(n) || (i = n) : i = a.test(n) ? n.replace("arrow", "") : "multiply" == n ? "*" : n
			}
			return i
		}

		function h(e, t) {
			return e.key ? d(e.key, t) : e.detail && e.detail.key ? d(e.detail.key, t) : function (e) {
				var t = "";
				return e && (t = e in i ? i[e] : s.test(e) ? (e = parseInt(e.replace("U+", "0x"), 16), String.fromCharCode(e).toLowerCase()) : e.toLowerCase()), t
			}(e.keyIdentifier) || function (e) {
				var t = "";
				return Number(e) && (t = 65 <= e && e <= 90 ? String.fromCharCode(32 + e) : 112 <= e && e <= 123 ? "f" + (e - 112) : 48 <= e && e <= 57 ? String(e - 48) : 96 <= e && e <= 105 ? String(e - 96) : n[e]), t
			}(e.keyCode) || ""
		}

		function u(e, t) {
			return h(t, e.hasModifiers) === e.key && (!e.hasModifiers || !!t.shiftKey == !!e.shiftKey && !!t.ctrlKey == !!e.ctrlKey && !!t.altKey == !!e.altKey && !!t.metaKey == !!e.metaKey)
		}

		function p(e) {
			return e.trim().split(" ").map(function (e) {
				return function (e) {
					return 1 === e.length ?
						{
							combo: e,
							key: e,
							event: "keydown"
						} : e.split("+").reduce(function (e, t) {
							var i = t.split(":"),
								n = i[0],
								r = i[1];
							return n in o ? (e[o[n]] = !0, e.hasModifiers = !0) : (e.key = n, e.event = r || "keydown"), e
						},
							{
								combo: e.split(":").shift()
							})
				}(e)
			})
		}
		Polymer.IronA11yKeysBehavior = {
			properties:
			{
				keyEventTarget:
				{
					type: Object,
					value: function () {
						return this
					}
				},
				stopKeyboardEventPropagation:
				{
					type: Boolean,
					value: !1
				},
				_boundKeyHandlers:
				{
					type: Array,
					value: function () {
						return []
					}
				},
				_imperativeKeyBindings:
				{
					type: Object,
					value: function () {
						return {}
					}
				}
			},
			observers: ["_resetKeyEventListeners(keyEventTarget, _boundKeyHandlers)"],
			keyBindings:
				{},
			registered: function () {
				this._prepKeyBindings()
			},
			attached: function () {
				this._listenKeyEventListeners()
			},
			detached: function () {
				this._unlistenKeyEventListeners()
			},
			addOwnKeyBinding: function (e, t) {
				this._imperativeKeyBindings[e] = t, this._prepKeyBindings(), this._resetKeyEventListeners()
			},
			removeOwnKeyBindings: function () {
				this._imperativeKeyBindings = {}, this._prepKeyBindings(), this._resetKeyEventListeners()
			},
			keyboardEventMatchesKeys: function (e, t) {
				for (var i = p(t), n = 0; n < i.length; ++n)
					if (u(i[n], e)) return !0;
				return !1
			},
			_collectKeyBindings: function () {
				var e = this.behaviors.map(function (e) {
					return e.keyBindings
				});
				return -1 === e.indexOf(this.keyBindings) && e.push(this.keyBindings), e
			},
			_prepKeyBindings: function () {
				for (var e in this._keyBindings = {}, this._collectKeyBindings().forEach(function (e) {
					for (var t in e) this._addKeyBinding(t, e[t])
				}, this), this._imperativeKeyBindings) this._addKeyBinding(e, this._imperativeKeyBindings[e]);
				for (var t in this._keyBindings) this._keyBindings[t].sort(function (e, t) {
					var i = e[0].hasModifiers;
					return i === t[0].hasModifiers ? 0 : i ? -1 : 1
				})
			},
			_addKeyBinding: function (e, t) {
				p(e).forEach(function (e) {
					this._keyBindings[e.event] = this._keyBindings[e.event] || [], this._keyBindings[e.event].push([e, t])
				}, this)
			},
			_resetKeyEventListeners: function () {
				this._unlistenKeyEventListeners(), this.isAttached && this._listenKeyEventListeners()
			},
			_listenKeyEventListeners: function () {
				this.keyEventTarget && Object.keys(this._keyBindings).forEach(function (e) {
					var t = this._keyBindings[e],
						i = this._onKeyBindingEvent.bind(this, t);
					this._boundKeyHandlers.push([this.keyEventTarget, e, i]), this.keyEventTarget.addEventListener(e, i)
				}, this)
			},
			_unlistenKeyEventListeners: function () {
				for (var e, t, i, n; this._boundKeyHandlers.length;) t = (e = this._boundKeyHandlers.pop())[0], i = e[1], n = e[2], t.removeEventListener(i, n)
			},
			_onKeyBindingEvent: function (e, t) {
				if (this.stopKeyboardEventPropagation && t.stopPropagation(), !t.defaultPrevented)
					for (var i = 0; i < e.length; i++) {
						var n = e[i][0],
							r = e[i][1];
						if (u(n, t) && (this._triggerKeyHandler(n, r, t), t.defaultPrevented)) return
					}
			},
			_triggerKeyHandler: function (e, t, i) {
				var n = Object.create(e);
				n.keyboardEvent = i;
				var r = new CustomEvent(e.event,
					{
						detail: n,
						cancelable: !0
					});
				this[t].call(this, r), r.defaultPrevented && i.preventDefault()
			}
		}
	}(),
	function () {
		"use strict";
		Polymer(
			{
				is: "iron-overlay-backdrop",
				properties:
				{
					opened:
					{
						reflectToAttribute: !0,
						type: Boolean,
						value: !1,
						observer: "_openedChanged"
					}
				},
				listeners:
				{
					transitionend: "_onTransitionend"
				},
				created: function () {
					this.__openedRaf = null
				},
				attached: function () {
					this.opened && this._openedChanged(this.opened)
				},
				prepare: function () {
					this.opened && !this.parentNode && Polymer.dom(document.body).appendChild(this)
				},
				open: function () {
					this.opened = !0
				},
				close: function () {
					this.opened = !1
				},
				complete: function () {
					this.opened || this.parentNode !== document.body || Polymer.dom(this.parentNode).removeChild(this)
				},
				_onTransitionend: function (e) {
					e && e.target === this && this.complete()
				},
				_openedChanged: function (e) {
					if (e) this.prepare();
					else {
						var t = window.getComputedStyle(this);
						"0s" !== t.transitionDuration && 0 != t.opacity || this.complete()
					}
					this.isAttached && (this.__openedRaf && (window.cancelAnimationFrame(this.__openedRaf), this.__openedRaf = null), this.scrollTop = this.scrollTop, this.__openedRaf = window.requestAnimationFrame(function () {
						this.__openedRaf = null, this.toggleClass("opened", this.opened)
					}.bind(this)))
				}
			})
	}(), Polymer.IronOverlayManagerClass = function () {
		this._overlays = [], this._minimumZ = 101, this._backdropElement = null, Polymer.Gestures.add(document.documentElement, "tap", null), document.addEventListener("tap", this._onCaptureClick.bind(this), !0), document.addEventListener("focus", this._onCaptureFocus.bind(this), !0), document.addEventListener("keydown", this._onCaptureKeyDown.bind(this), !0)
	}, Polymer.IronOverlayManagerClass.prototype = {
		constructor: Polymer.IronOverlayManagerClass,
		get backdropElement() {
			return this._backdropElement || (this._backdropElement = document.createElement("iron-overlay-backdrop")), this._backdropElement
		},
		get deepActiveElement() {
			for (var e = document.activeElement || document.body; e.root && Polymer.dom(e.root).activeElement;) e = Polymer.dom(e.root).activeElement;
			return e
		},
		_bringOverlayAtIndexToFront: function (e) {
			var t = this._overlays[e];
			if (t) {
				var i = this._overlays.length - 1,
					n = this._overlays[i];
				if (n && this._shouldBeBehindOverlay(t, n) && i--, !(i <= e)) {
					var r = Math.max(this.currentOverlayZ(), this._minimumZ);
					for (this._getZ(t) <= r && this._applyOverlayZ(t, r); e < i;) this._overlays[e] = this._overlays[e + 1], e++;
					this._overlays[i] = t
				}
			}
		},
		addOrRemoveOverlay: function (e) {
			e.opened ? this.addOverlay(e) : this.removeOverlay(e)
		},
		addOverlay: function (e) {
			var t = this._overlays.indexOf(e);
			if (0 <= t) return this._bringOverlayAtIndexToFront(t), void this.trackBackdrop();
			var i = this._overlays.length,
				n = this._overlays[i - 1],
				r = Math.max(this._getZ(n), this._minimumZ),
				o = this._getZ(e);
			if (n && this._shouldBeBehindOverlay(e, n)) {
				this._applyOverlayZ(n, r), i--;
				var s = this._overlays[i - 1];
				r = Math.max(this._getZ(s), this._minimumZ)
			}
			o <= r && this._applyOverlayZ(e, r), this._overlays.splice(i, 0, e), this.trackBackdrop()
		},
		removeOverlay: function (e) {
			var t = this._overlays.indexOf(e); - 1 !== t && (this._overlays.splice(t, 1), this.trackBackdrop())
		},
		currentOverlay: function () {
			var e = this._overlays.length - 1;
			return this._overlays[e]
		},
		currentOverlayZ: function () {
			return this._getZ(this.currentOverlay())
		},
		ensureMinimumZ: function (e) {
			this._minimumZ = Math.max(this._minimumZ, e)
		},
		focusOverlay: function () {
			var e = this.currentOverlay();
			e && e._applyFocus()
		},
		trackBackdrop: function () {
			var e = this._overlayWithBackdrop();
			(e || this._backdropElement) && (this.backdropElement.style.zIndex = this._getZ(e) - 1, this.backdropElement.opened = !!e)
		},
		getBackdrops: function () {
			for (var e = [], t = 0; t < this._overlays.length; t++) this._overlays[t].withBackdrop && e.push(this._overlays[t]);
			return e
		},
		backdropZ: function () {
			return this._getZ(this._overlayWithBackdrop()) - 1
		},
		_overlayWithBackdrop: function () {
			for (var e = 0; e < this._overlays.length; e++)
				if (this._overlays[e].withBackdrop) return this._overlays[e]
		},
		_getZ: function (e) {
			var t = this._minimumZ;
			if (e) {
				var i = Number(e.style.zIndex || window.getComputedStyle(e).zIndex);
				i == i && (t = i)
			}
			return t
		},
		_setZ: function (e, t) {
			e.style.zIndex = t
		},
		_applyOverlayZ: function (e, t) {
			this._setZ(e, t + 2)
		},
		_overlayInPath: function (e) {
			e = e || [];
			for (var t = 0; t < e.length; t++)
				if (e[t]._manager === this) return e[t]
		},
		_onCaptureClick: function (e) {
			var t = this.currentOverlay();
			t && this._overlayInPath(Polymer.dom(e).path) !== t && t._onCaptureClick(e)
		},
		_onCaptureFocus: function (e) {
			var t = this.currentOverlay();
			t && t._onCaptureFocus(e)
		},
		_onCaptureKeyDown: function (e) {
			var t = this.currentOverlay();
			t && (Polymer.IronA11yKeysBehavior.keyboardEventMatchesKeys(e, "esc") ? t._onCaptureEsc(e) : Polymer.IronA11yKeysBehavior.keyboardEventMatchesKeys(e, "tab") && t._onCaptureTab(e))
		},
		_shouldBeBehindOverlay: function (e, t) {
			return !e.alwaysOnTop && t.alwaysOnTop
		}
	}, Polymer.IronOverlayManager = new Polymer.IronOverlayManagerClass,
	function () {
		"use strict";
		var e = Element.prototype,
			t = e.matches || e.matchesSelector || e.mozMatchesSelector || e.msMatchesSelector || e.oMatchesSelector || e.webkitMatchesSelector;
		Polymer.IronFocusablesHelper = {
			getTabbableNodes: function (e) {
				var t = [];
				return this._collectTabbableNodes(e, t) ? this._sortByTabIndex(t) : t
			},
			isFocusable: function (e) {
				return t.call(e, "input, select, textarea, button, object") ? t.call(e, ":not([disabled])") : t.call(e, "a[href], area[href], iframe, [tabindex], [contentEditable]")
			},
			isTabbable: function (e) {
				return this.isFocusable(e) && t.call(e, ':not([tabindex="-1"])') && this._isVisible(e)
			},
			_normalizedTabIndex: function (e) {
				if (this.isFocusable(e)) {
					var t = e.getAttribute("tabindex") || 0;
					return Number(t)
				}
				return -1
			},
			_collectTabbableNodes: function (e, t) {
				if (e.nodeType !== Node.ELEMENT_NODE || !this._isVisible(e)) return !1;
				var i, n = e,
					r = this._normalizedTabIndex(n),
					o = 0 < r;
				0 <= r && t.push(n), i = "content" === n.localName ? Polymer.dom(n).getDistributedNodes() : Polymer.dom(n.root || n).children;
				for (var s = 0; s < i.length; s++) {
					var a = this._collectTabbableNodes(i[s], t);
					o = o || a
				}
				return o
			},
			_isVisible: function (e) {
				var t = e.style;
				return "hidden" !== t.visibility && "none" !== t.display && ("hidden" !== (t = window.getComputedStyle(e)).visibility && "none" !== t.display)
			},
			_sortByTabIndex: function (e) {
				var t = e.length;
				if (t < 2) return e;
				var i = Math.ceil(t / 2),
					n = this._sortByTabIndex(e.slice(0, i)),
					r = this._sortByTabIndex(e.slice(i));
				return this._mergeSortByTabIndex(n, r)
			},
			_mergeSortByTabIndex: function (e, t) {
				for (var i = []; 0 < e.length && 0 < t.length;) this._hasLowerTabOrder(e[0], t[0]) ? i.push(t.shift()) : i.push(e.shift());
				return i.concat(e, t)
			},
			_hasLowerTabOrder: function (e, t) {
				var i = Math.max(e.tabIndex, 0),
					n = Math.max(t.tabIndex, 0);
				return 0 === i || 0 === n ? i < n : n < i
			}
		}
	}(),
	function () {
		"use strict";
		Polymer.IronOverlayBehaviorImpl = {
			properties:
			{
				opened:
				{
					observer: "_openedChanged",
					type: Boolean,
					value: !1,
					notify: !0
				},
				canceled:
				{
					observer: "_canceledChanged",
					readOnly: !0,
					type: Boolean,
					value: !1
				},
				withBackdrop:
				{
					observer: "_withBackdropChanged",
					type: Boolean
				},
				noAutoFocus:
				{
					type: Boolean,
					value: !1
				},
				noCancelOnEscKey:
				{
					type: Boolean,
					value: !1
				},
				noCancelOnOutsideClick:
				{
					type: Boolean,
					value: !1
				},
				closingReason:
				{
					type: Object
				},
				restoreFocusOnClose:
				{
					type: Boolean,
					value: !1
				},
				alwaysOnTop:
				{
					type: Boolean
				},
				_manager:
				{
					type: Object,
					value: Polymer.IronOverlayManager
				},
				_focusedChild:
				{
					type: Object
				}
			},
			listeners:
			{
				"iron-resize": "_onIronResize"
			},
			get backdropElement() {
				return this._manager.backdropElement
			},
			get _focusNode() {
				return this._focusedChild || Polymer.dom(this).querySelector("[autofocus]") || this
			},
			get _focusableNodes() {
				return Polymer.IronFocusablesHelper.getTabbableNodes(this)
			},
			ready: function () {
				this.__isAnimating = !1, this.__shouldRemoveTabIndex = !1, this.__firstFocusableNode = this.__lastFocusableNode = null, this.__raf = null, this.__restoreFocusNode = null, this._ensureSetup()
			},
			attached: function () {
				this.opened && this._openedChanged(this.opened), this._observer = Polymer.dom(this).observeNodes(this._onNodesChange)
			},
			detached: function () {
				Polymer.dom(this).unobserveNodes(this._observer), this._observer = null, this.__raf && (window.cancelAnimationFrame(this.__raf), this.__raf = null), this._manager.removeOverlay(this)
			},
			toggle: function () {
				this._setCanceled(!1), this.opened = !this.opened
			},
			open: function () {
				this._setCanceled(!1), this.opened = !0
			},
			close: function () {
				this._setCanceled(!1), this.opened = !1
			},
			cancel: function (e) {
				this.fire("iron-overlay-canceled", e,
					{
						cancelable: !0
					}).defaultPrevented || (this._setCanceled(!0), this.opened = !1)
			},
			invalidateTabbables: function () {
				this.__firstFocusableNode = this.__lastFocusableNode = null
			},
			_ensureSetup: function () {
				this._overlaySetup || (this._overlaySetup = !0, this.style.outline = "none", this.style.display = "none")
			},
			_openedChanged: function (e) {
				e ? this.removeAttribute("aria-hidden") : this.setAttribute("aria-hidden", "true"), this.isAttached && (this.__isAnimating = !0, this.__onNextAnimationFrame(this.__openedChanged))
			},
			_canceledChanged: function () {
				this.closingReason = this.closingReason ||
					{}, this.closingReason.canceled = this.canceled
			},
			_withBackdropChanged: function () {
				this.withBackdrop && !this.hasAttribute("tabindex") ? (this.setAttribute("tabindex", "-1"), this.__shouldRemoveTabIndex = !0) : this.__shouldRemoveTabIndex && (this.removeAttribute("tabindex"), this.__shouldRemoveTabIndex = !1), this.opened && this.isAttached && this._manager.trackBackdrop()
			},
			_prepareRenderOpened: function () {
				this.__restoreFocusNode = this._manager.deepActiveElement, this._preparePositioning(), this.refit(), this._finishPositioning(), this.noAutoFocus && document.activeElement === this._focusNode && (this._focusNode.blur(), this.__restoreFocusNode.focus())
			},
			_renderOpened: function () {
				this._finishRenderOpened()
			},
			_renderClosed: function () {
				this._finishRenderClosed()
			},
			_finishRenderOpened: function () {
				this.notifyResize(), this.__isAnimating = !1, this.fire("iron-overlay-opened")
			},
			_finishRenderClosed: function () {
				this.style.display = "none", this.style.zIndex = "", this.notifyResize(), this.__isAnimating = !1, this.fire("iron-overlay-closed", this.closingReason)
			},
			_preparePositioning: function () {
				this.style.transition = this.style.webkitTransition = "none", this.style.transform = this.style.webkitTransform = "none", this.style.display = ""
			},
			_finishPositioning: function () {
				this.style.display = "none", this.scrollTop = this.scrollTop, this.style.transition = this.style.webkitTransition = "", this.style.transform = this.style.webkitTransform = "", this.style.display = "", this.scrollTop = this.scrollTop
			},
			_applyFocus: function () {
				if (this.opened) this.noAutoFocus || this._focusNode.focus();
				else {
					this._focusNode.blur(), this._focusedChild = null, this.restoreFocusOnClose && this.__restoreFocusNode && this.__restoreFocusNode.focus(), this.__restoreFocusNode = null;
					var e = this._manager.currentOverlay();
					e && this !== e && e._applyFocus()
				}
			},
			_onCaptureClick: function (e) {
				this.noCancelOnOutsideClick || this.cancel(e)
			},
			_onCaptureFocus: function (e) {
				if (this.withBackdrop) {
					var t = Polymer.dom(e).path; - 1 === t.indexOf(this) ? (e.stopPropagation(), this._applyFocus()) : this._focusedChild = t[0]
				}
			},
			_onCaptureEsc: function (e) {
				this.noCancelOnEscKey || this.cancel(e)
			},
			_onCaptureTab: function (e) {
				if (this.withBackdrop) {
					this.__ensureFirstLastFocusables();
					var t = e.shiftKey,
						i = t ? this.__firstFocusableNode : this.__lastFocusableNode,
						n = t ? this.__lastFocusableNode : this.__firstFocusableNode,
						r = !1;
					if (i === n) r = !0;
					else {
						var o = this._manager.deepActiveElement;
						r = o === i || o === this
					}
					r && (e.preventDefault(), this._focusedChild = n, this._applyFocus())
				}
			},
			_onIronResize: function () {
				this.opened && !this.__isAnimating && this.__onNextAnimationFrame(this.refit)
			},
			_onNodesChange: function () {
				this.opened && !this.__isAnimating && (this.invalidateTabbables(), this.notifyResize())
			},
			__ensureFirstLastFocusables: function () {
				if (!this.__firstFocusableNode || !this.__lastFocusableNode) {
					var e = this._focusableNodes;
					this.__firstFocusableNode = e[0], this.__lastFocusableNode = e[e.length - 1]
				}
			},
			__openedChanged: function () {
				this.opened ? (this._prepareRenderOpened(), this._manager.addOverlay(this), this._applyFocus(), this._renderOpened()) : (this._manager.removeOverlay(this), this._applyFocus(), this._renderClosed())
			},
			__onNextAnimationFrame: function (e) {
				this.__raf && window.cancelAnimationFrame(this.__raf);
				var t = this;
				this.__raf = window.requestAnimationFrame(function () {
					t.__raf = null, e.call(t)
				})
			}
		}, Polymer.IronOverlayBehavior = [Polymer.IronFitBehavior, Polymer.IronResizableBehavior, Polymer.IronOverlayBehaviorImpl]
	}(), Polymer.PaperDialogBehaviorImpl = {
		hostAttributes:
		{
			role: "dialog",
			tabindex: "-1"
		},
		properties:
		{
			modal:
			{
				type: Boolean,
				value: !1
			}
		},
		observers: ["_modalChanged(modal, _readied)"],
		listeners:
		{
			tap: "_onDialogClick"
		},
		ready: function () {
			this.__prevNoCancelOnOutsideClick = this.noCancelOnOutsideClick, this.__prevNoCancelOnEscKey = this.noCancelOnEscKey, this.__prevWithBackdrop = this.withBackdrop
		},
		_modalChanged: function (e, t) {
			t && (e ? (this.__prevNoCancelOnOutsideClick = this.noCancelOnOutsideClick, this.__prevNoCancelOnEscKey = this.noCancelOnEscKey, this.__prevWithBackdrop = this.withBackdrop, this.noCancelOnOutsideClick = !0, this.noCancelOnEscKey = !0, this.withBackdrop = !0) : (this.noCancelOnOutsideClick = this.noCancelOnOutsideClick && this.__prevNoCancelOnOutsideClick, this.noCancelOnEscKey = this.noCancelOnEscKey && this.__prevNoCancelOnEscKey, this.withBackdrop = this.withBackdrop && this.__prevWithBackdrop))
		},
		_updateClosingReasonConfirmed: function (e) {
			this.closingReason = this.closingReason ||
				{}, this.closingReason.confirmed = e
		},
		_onDialogClick: function (e) {
			for (var t = Polymer.dom(e).path, i = 0; i < t.indexOf(this); i++) {
				var n = t[i];
				if (n.hasAttribute && (n.hasAttribute("dialog-dismiss") || n.hasAttribute("dialog-confirm"))) {
					this._updateClosingReasonConfirmed(n.hasAttribute("dialog-confirm")), this.close(), e.stopPropagation();
					break
				}
			}
		}
	}, Polymer.PaperDialogBehavior = [Polymer.IronOverlayBehavior, Polymer.PaperDialogBehaviorImpl], Polymer(
		{
			is: "paper-dialog",
			behaviors: [Polymer.PaperDialogBehavior, Polymer.NeonAnimationRunnerBehavior],
			listeners:
			{
				"neon-animation-finish": "_onNeonAnimationFinish"
			},
			_renderOpened: function () {
				this.cancelAnimation(), this.playAnimation("entry")
			},
			_renderClosed: function () {
				this.cancelAnimation(), this.playAnimation("exit")
			},
			_onNeonAnimationFinish: function () {
				this.opened ? this._finishRenderOpened() : this._finishRenderClosed()
			}
		}), Polymer.IronRangeBehavior = {
			properties:
			{
				value:
				{
					type: Number,
					value: 0,
					notify: !0,
					reflectToAttribute: !0
				},
				min:
				{
					type: Number,
					value: 0,
					notify: !0
				},
				max:
				{
					type: Number,
					value: 100,
					notify: !0
				},
				step:
				{
					type: Number,
					value: 1,
					notify: !0
				},
				ratio:
				{
					type: Number,
					value: 0,
					readOnly: !0,
					notify: !0
				}
			},
			observers: ["_update(value, min, max, step)"],
			_calcRatio: function (e) {
				return (this._clampValue(e) - this.min) / (this.max - this.min)
			},
			_clampValue: function (e) {
				return Math.min(this.max, Math.max(this.min, this._calcStep(e)))
			},
			_calcStep: function (e) {
				if (e = parseFloat(e), !this.step) return e;
				var t = Math.round((e - this.min) / this.step);
				return this.step < 1 ? t / (1 / this.step) + this.min : t * this.step + this.min
			},
			_validateValue: function () {
				var e = this._clampValue(this.value);
				return this.value = this.oldValue = isNaN(e) ? this.oldValue : e, this.value !== e
			},
			_update: function () {
				this._validateValue(), this._setRatio(100 * this._calcRatio(this.value))
			}
		}, Polymer(
			{
				is: "paper-progress",
				behaviors: [Polymer.IronRangeBehavior],
				properties:
				{
					secondaryProgress:
					{
						type: Number,
						value: 0
					},
					secondaryRatio:
					{
						type: Number,
						value: 0,
						readOnly: !0
					},
					indeterminate:
					{
						type: Boolean,
						value: !1,
						observer: ""
					},
					disabled:
					{
						type: Boolean,
						value: !1,
						reflectToAttribute: !0,
						observer: "_disabledChanged"
					}
				},
				observers: [],
				hostAttributes:
				{
					role: "progressbar"
				},

				_transformProgress: function (e, t) {
					var i = "scaleX(" + t / 100 + ")";
					e.style.transform = e.style.webkitTransform = i
				},
				_mainRatioChanged: function (e) {
					this._transformProgress(this.$.primaryProgress, e)
				},
				_disabledChanged: function (e) {
					this.setAttribute("aria-disabled", e ? "true" : "false")
				},
				_hideSecondaryProgress: function (e) {
					return 0 === e
				}
			}), Polymer.IronControlState = {
				properties:
				{
					focused:
					{
						type: Boolean,
						value: !1,
						notify: !0,
						readOnly: !0,
						reflectToAttribute: !0
					},
					disabled:
					{
						type: Boolean,
						value: !1,
						notify: !0,
						observer: "_disabledChanged",
						reflectToAttribute: !0
					},
					_oldTabIndex:
					{
						type: Number
					},
					_boundFocusBlurHandler:
					{
						type: Function,
						value: function () {
							return this._focusBlurHandler.bind(this)
						}
					}
				},
				observers: ["_changedControlState(focused, disabled)"],
				ready: function () {
					this.addEventListener("focus", this._boundFocusBlurHandler, !0), this.addEventListener("blur", this._boundFocusBlurHandler, !0)
				},
				_focusBlurHandler: function (e) {
					if (e.target === this) this._setFocused("focus" === e.type);
					else if (!this.shadowRoot) {
						var t = Polymer.dom(e).localTarget;
						this.isLightDescendant(t) || this.fire(e.type,
							{
								sourceEvent: e
							},
							{
								node: this,
								bubbles: e.bubbles,
								cancelable: e.cancelable
							})
					}
				},
				_disabledChanged: function (e, t) {
					this.setAttribute("aria-disabled", e ? "true" : "false"), this.style.pointerEvents = e ? "none" : "", e ? (this._oldTabIndex = this.tabIndex, this._setFocused(!1), this.tabIndex = -1, this.blur()) : void 0 !== this._oldTabIndex && (this.tabIndex = this._oldTabIndex)
				},
				_changedControlState: function () {
					this._controlStateChanged && this._controlStateChanged()
				}
			}, Polymer.IronButtonStateImpl = {
				properties:
				{
					pressed:
					{
						type: Boolean,
						readOnly: !0,
						value: !1,
						reflectToAttribute: !0,
						observer: "_pressedChanged"
					},
					toggles:
					{
						type: Boolean,
						value: !1,
						reflectToAttribute: !0
					},
					active:
					{
						type: Boolean,
						value: !1,
						notify: !0,
						reflectToAttribute: !0
					},
					pointerDown:
					{
						type: Boolean,
						readOnly: !0,
						value: !1
					},
					receivedFocusFromKeyboard:
					{
						type: Boolean,
						readOnly: !0
					},
					ariaActiveAttribute:
					{
						type: String,
						value: "aria-pressed",
						observer: "_ariaActiveAttributeChanged"
					}
				},
				listeners:
				{
					down: "_downHandler",
					up: "_upHandler",
					tap: "_tapHandler"
				},
				observers: ["_focusChanged(focused)", "_activeChanged(active, ariaActiveAttribute)"],
				keyBindings:
				{
					"enter:keydown": "_asyncClick",
					"space:keydown": "_spaceKeyDownHandler",
					"space:keyup": "_spaceKeyUpHandler"
				},
				_mouseEventRe: /^mouse/,
				_tapHandler: function () {
					this.toggles ? this._userActivate(!this.active) : this.active = !1
				},
				_focusChanged: function (e) {
					this._detectKeyboardFocus(e), e || this._setPressed(!1)
				},
				_detectKeyboardFocus: function (e) {
					this._setReceivedFocusFromKeyboard(!this.pointerDown && e)
				},
				_userActivate: function (e) {
					this.active !== e && (this.active = e, this.fire("change"))
				},
				_downHandler: function (e) {
					this._setPointerDown(!0), this._setPressed(!0), this._setReceivedFocusFromKeyboard(!1)
				},
				_upHandler: function () {
					this._setPointerDown(!1), this._setPressed(!1)
				},
				_spaceKeyDownHandler: function (e) {
					var t = e.detail.keyboardEvent,
						i = Polymer.dom(t).localTarget;
					this.isLightDescendant(i) || (t.preventDefault(), t.stopImmediatePropagation(), this._setPressed(!0))
				},
				_spaceKeyUpHandler: function (e) {
					var t = e.detail.keyboardEvent,
						i = Polymer.dom(t).localTarget;
					this.isLightDescendant(i) || (this.pressed && this._asyncClick(), this._setPressed(!1))
				},
				_asyncClick: function () {
					this.async(function () {
						this.click()
					}, 1)
				},
				_pressedChanged: function (e) {
					this._changedButtonState()
				},
				_ariaActiveAttributeChanged: function (e, t) {
					t && t != e && this.hasAttribute(t) && this.removeAttribute(t)
				},
				_activeChanged: function (e, t) {
					this.toggles ? this.setAttribute(this.ariaActiveAttribute, e ? "true" : "false") : this.removeAttribute(this.ariaActiveAttribute), this._changedButtonState()
				},
				_controlStateChanged: function () {
					this.disabled ? this._setPressed(!1) : this._changedButtonState()
				},
				_changedButtonState: function () {
					this._buttonStateChanged && this._buttonStateChanged()
				}
			}, Polymer.IronButtonState = [Polymer.IronA11yKeysBehavior, Polymer.IronButtonStateImpl],
	function () {
		var s = {
			distance: function (e, t, i, n) {
				var r = e - i,
					o = t - n;
				return Math.sqrt(r * r + o * o)
			},
			now: window.performance && window.performance.now ? window.performance.now.bind(window.performance) : Date.now
		};

		function e(e) {
			this.element = e, this.width = this.boundingRect.width, this.height = this.boundingRect.height, this.size = Math.max(this.width, this.height)
		}

		function a(e) {
			this.element = e, this.color = window.getComputedStyle(e).color, this.wave = document.createElement("div"), this.waveContainer = document.createElement("div"), this.wave.style.backgroundColor = this.color, this.wave.classList.add("wave"), this.waveContainer.classList.add("wave-container"), Polymer.dom(this.waveContainer).appendChild(this.wave), this.resetInteractionState()
		}
		e.prototype = {
			get boundingRect() {
				return this.element.getBoundingClientRect()
			},
			furthestCornerDistanceFrom: function (e, t) {
				var i = s.distance(e, t, 0, 0),
					n = s.distance(e, t, this.width, 0),
					r = s.distance(e, t, 0, this.height),
					o = s.distance(e, t, this.width, this.height);
				return Math.max(i, n, r, o)
			}
		}, a.MAX_RADIUS = 300, a.prototype = {
			get recenters() {
				return this.element.recenters
			},
			get center() {
				return this.element.center
			},
			get mouseDownElapsed() {
				var e;
				return this.mouseDownStart ? (e = s.now() - this.mouseDownStart, this.mouseUpStart && (e -= this.mouseUpElapsed), e) : 0
			},
			get mouseUpElapsed() {
				return this.mouseUpStart ? s.now() - this.mouseUpStart : 0
			},
			get mouseDownElapsedSeconds() {
				return this.mouseDownElapsed / 1e3
			},
			get mouseUpElapsedSeconds() {
				return this.mouseUpElapsed / 1e3
			},
			get mouseInteractionSeconds() {
				return this.mouseDownElapsedSeconds + this.mouseUpElapsedSeconds
			},
			get initialOpacity() {
				return this.element.initialOpacity
			},
			get opacityDecayVelocity() {
				return this.element.opacityDecayVelocity
			},
			get radius() {
				var e = this.containerMetrics.width * this.containerMetrics.width,
					t = this.containerMetrics.height * this.containerMetrics.height,
					i = 1.1 * Math.min(Math.sqrt(e + t), a.MAX_RADIUS) + 5,
					n = 1.1 - i / a.MAX_RADIUS * .2,
					r = this.mouseInteractionSeconds / n,
					o = i * (1 - Math.pow(80, -r));
				return Math.abs(o)
			},
			get opacity() {
				return this.mouseUpStart ? Math.max(0, this.initialOpacity - this.mouseUpElapsedSeconds * this.opacityDecayVelocity) : this.initialOpacity
			},
			get outerOpacity() {
				var e = .3 * this.mouseUpElapsedSeconds,
					t = this.opacity;
				return Math.max(0, Math.min(e, t))
			},
			get isOpacityFullyDecayed() {
				return this.opacity < .01 && this.radius >= Math.min(this.maxRadius, a.MAX_RADIUS)
			},
			get isRestingAtMaxRadius() {
				return this.opacity >= this.initialOpacity && this.radius >= Math.min(this.maxRadius, a.MAX_RADIUS)
			},
			get isAnimationComplete() {
				return this.mouseUpStart ? this.isOpacityFullyDecayed : this.isRestingAtMaxRadius
			},
			get translationFraction() {
				return Math.min(1, this.radius / this.containerMetrics.size * 2 / Math.sqrt(2))
			},
			get xNow() {
				return this.xEnd ? this.xStart + this.translationFraction * (this.xEnd - this.xStart) : this.xStart
			},
			get yNow() {
				return this.yEnd ? this.yStart + this.translationFraction * (this.yEnd - this.yStart) : this.yStart
			},
			get isMouseDown() {
				return this.mouseDownStart && !this.mouseUpStart
			},
			resetInteractionState: function () {
				this.maxRadius = 0, this.mouseDownStart = 0, this.mouseUpStart = 0, this.xStart = 0, this.yStart = 0, this.xEnd = 0, this.yEnd = 0, this.slideDistance = 0, this.containerMetrics = new e(this.element)
			},
			draw: function () {
				var e, t, i;
				this.wave.style.opacity = this.opacity, e = this.radius / (this.containerMetrics.size / 2), t = this.xNow - this.containerMetrics.width / 2, i = this.yNow - this.containerMetrics.height / 2, this.waveContainer.style.webkitTransform = "translate(" + t + "px, " + i + "px)", this.waveContainer.style.transform = "translate3d(" + t + "px, " + i + "px, 0)", this.wave.style.webkitTransform = "scale(" + e + "," + e + ")", this.wave.style.transform = "scale3d(" + e + "," + e + ",1)"
			},
			downAction: function (e) {
				var t = this.containerMetrics.width / 2,
					i = this.containerMetrics.height / 2;
				this.resetInteractionState(), this.mouseDownStart = s.now(), this.center ? (this.xStart = t, this.yStart = i, this.slideDistance = s.distance(this.xStart, this.yStart, this.xEnd, this.yEnd)) : (this.xStart = e ? e.detail.x - this.containerMetrics.boundingRect.left : this.containerMetrics.width / 2, this.yStart = e ? e.detail.y - this.containerMetrics.boundingRect.top : this.containerMetrics.height / 2), this.recenters && (this.xEnd = t, this.yEnd = i, this.slideDistance = s.distance(this.xStart, this.yStart, this.xEnd, this.yEnd)), this.maxRadius = this.containerMetrics.furthestCornerDistanceFrom(this.xStart, this.yStart), this.waveContainer.style.top = (this.containerMetrics.height - this.containerMetrics.size) / 2 + "px", this.waveContainer.style.left = (this.containerMetrics.width - this.containerMetrics.size) / 2 + "px", this.waveContainer.style.width = this.containerMetrics.size + "px", this.waveContainer.style.height = this.containerMetrics.size + "px"
			},
			upAction: function (e) {
				this.isMouseDown && (this.mouseUpStart = s.now())
			},
			remove: function () {
				Polymer.dom(this.waveContainer.parentNode).removeChild(this.waveContainer)
			}
		}, Polymer(
			{
				is: "paper-ripple",
				behaviors: [Polymer.IronA11yKeysBehavior],
				properties:
				{
					initialOpacity:
					{
						type: Number,
						value: .25
					},
					opacityDecayVelocity:
					{
						type: Number,
						value: .8
					},
					recenters:
					{
						type: Boolean,
						value: !1
					},
					center:
					{
						type: Boolean,
						value: !1
					},
					ripples:
					{
						type: Array,
						value: function () {
							return []
						}
					},
					animating:
					{
						type: Boolean,
						readOnly: !0,
						reflectToAttribute: !0,
						value: !1
					},
					holdDown:
					{
						type: Boolean,
						value: !1,
						observer: "_holdDownChanged"
					},
					noink:
					{
						type: Boolean,
						value: !1
					},
					_animating:
					{
						type: Boolean
					},
					_boundAnimate:
					{
						type: Function,
						value: function () {
							return this.animate.bind(this)
						}
					}
				},
				get target() {
					return this.keyEventTarget
				},
				keyBindings:
				{
					"enter:keydown": "_onEnterKeydown",
					"space:keydown": "_onSpaceKeydown",
					"space:keyup": "_onSpaceKeyup"
				},
				attached: function () {
					11 == this.parentNode.nodeType ? this.keyEventTarget = Polymer.dom(this).getOwnerRoot().host : this.keyEventTarget = this.parentNode;
					var e = this.keyEventTarget;
					this.listen(e, "up", "uiUpAction"), this.listen(e, "down", "uiDownAction")
				},
				detached: function () {
					this.unlisten(this.keyEventTarget, "up", "uiUpAction"), this.unlisten(this.keyEventTarget, "down", "uiDownAction"), this.keyEventTarget = null
				},
				get shouldKeepAnimating() {
					for (var e = 0; e < this.ripples.length; ++e)
						if (!this.ripples[e].isAnimationComplete) return !0;
					return !1
				},
				simulatedRipple: function () {
					this.downAction(null), this.async(function () {
						this.upAction()
					}, 1)
				},
				uiDownAction: function (e) {
					this.noink || this.downAction(e)
				},
				downAction: function (e) {
					this.holdDown && 0 < this.ripples.length || (this.addRipple().downAction(e), this._animating || (this._animating = !0, this.animate()))
				},
				uiUpAction: function (e) {
					this.noink || this.upAction(e)
				},
				upAction: function (t) {
					this.holdDown || (this.ripples.forEach(function (e) {
						e.upAction(t)
					}), this._animating = !0, this.animate())
				},
				onAnimationComplete: function () {
					this._animating = !1, this.$.background.style.backgroundColor = null, this.fire("transitionend")
				},
				addRipple: function () {
					var e = new a(this);
					return Polymer.dom(this.$.waves).appendChild(e.waveContainer), this.$.background.style.backgroundColor = e.color, this.ripples.push(e), this._setAnimating(!0), e
				},
				removeRipple: function (e) {
					var t = this.ripples.indexOf(e);
					t < 0 || (this.ripples.splice(t, 1), e.remove(), this.ripples.length || this._setAnimating(!1))
				},
				animate: function () {
					if (this._animating) {
						var e, t;
						for (e = 0; e < this.ripples.length; ++e)(t = this.ripples[e]).draw(), this.$.background.style.opacity = t.outerOpacity, t.isOpacityFullyDecayed && !t.isRestingAtMaxRadius && this.removeRipple(t);
						this.shouldKeepAnimating || 0 !== this.ripples.length ? window.requestAnimationFrame(this._boundAnimate) : this.onAnimationComplete()
					}
				},
				_onEnterKeydown: function () {
					this.uiDownAction(), this.async(this.uiUpAction, 1)
				},
				_onSpaceKeydown: function () {
					this.uiDownAction()
				},
				_onSpaceKeyup: function () {
					this.uiUpAction()
				},
				_holdDownChanged: function (e, t) {
					void 0 !== t && (e ? this.downAction() : this.upAction())
				}
			})
	}(), Polymer.PaperRippleBehavior = {
		properties:
		{
			noink:
			{
				type: Boolean,
				observer: "_noinkChanged"
			},
			_rippleContainer:
			{
				type: Object
			}
		},
		_buttonStateChanged: function () {
			this.focused && this.ensureRipple()
		},
		_downHandler: function (e) {
			Polymer.IronButtonStateImpl._downHandler.call(this, e), this.pressed && this.ensureRipple(e)
		},
		ensureRipple: function (e) {
			if (!this.hasRipple()) {
				this._ripple = this._createRipple(), this._ripple.noink = this.noink;
				var t = this._rippleContainer || this.root;
				if (t && Polymer.dom(t).appendChild(this._ripple), e) {
					var i = Polymer.dom(this._rippleContainer || this),
						n = Polymer.dom(e).rootTarget;
					i.deepContains(n) && this._ripple.uiDownAction(e)
				}
			}
		},
		getRipple: function () {
			return this.ensureRipple(), this._ripple
		},
		hasRipple: function () {
			return Boolean(this._ripple)
		},
		_createRipple: function () {
			return document.createElement("paper-ripple")
		},
		_noinkChanged: function (e) {
			this.hasRipple() && (this._ripple.noink = e)
		}
	}, Polymer.PaperButtonBehaviorImpl = {
		properties:
		{
			elevation:
			{
				type: Number,
				reflectToAttribute: !0,
				readOnly: !0
			}
		},
		observers: ["_calculateElevation(focused, disabled, active, pressed, receivedFocusFromKeyboard)", "_computeKeyboardClass(receivedFocusFromKeyboard)"],
		hostAttributes:
		{
			role: "button",
			tabindex: "0",
			animated: !0
		},
		_calculateElevation: function () {
			var e = 1;
			this.disabled ? e = 0 : this.active || this.pressed ? e = 4 : this.receivedFocusFromKeyboard && (e = 3), this._setElevation(e)
		},
		_computeKeyboardClass: function (e) {
			this.toggleClass("keyboard-focus", e)
		},
		_spaceKeyDownHandler: function (e) {
			Polymer.IronButtonStateImpl._spaceKeyDownHandler.call(this, e), this.hasRipple() && this.getRipple().ripples.length < 1 && this._ripple.uiDownAction()
		},
		_spaceKeyUpHandler: function (e) {
			Polymer.IronButtonStateImpl._spaceKeyUpHandler.call(this, e), this.hasRipple() && this._ripple.uiUpAction()
		}
	}, Polymer.PaperButtonBehavior = [Polymer.IronButtonState, Polymer.IronControlState, Polymer.PaperRippleBehavior, Polymer.PaperButtonBehaviorImpl], Polymer(
		{
			is: "paper-button",
			behaviors: [Polymer.PaperButtonBehavior],
			properties:
			{
				raised:
				{
					type: Boolean,
					reflectToAttribute: !0,
					value: !1,
					observer: "_calculateElevation"
				}
			},
			_calculateElevation: function () {
				this.raised ? Polymer.PaperButtonBehaviorImpl._calculateElevation.apply(this) : this._setElevation(0)
			}
		}), Polymer(
			{
				is: "iron-icon",
				properties:
				{
					icon:
					{
						type: String
					},
					theme:
					{
						type: String
					},
					src:
					{
						type: String
					},
					_meta:
					{
						value: Polymer.Base.create("iron-meta",
							{
								type: "iconset"
							})
					}
				},
				observers: ["_updateIcon(_meta, isAttached)", "_updateIcon(theme, isAttached)", "_srcChanged(src, isAttached)", "_iconChanged(icon, isAttached)"],
				_DEFAULT_ICONSET: "icons",
				_iconChanged: function (e) {
					var t = (e || "").split(":");
					this._iconName = t.pop(), this._iconsetName = t.pop() || this._DEFAULT_ICONSET, this._updateIcon()
				},
				_srcChanged: function (e) {
					this._updateIcon()
				},
				_usesIconset: function () {
					return this.icon || !this.src
				},
				_updateIcon: function () {
					this._usesIconset() ? (this._img && this._img.parentNode && Polymer.dom(this.root).removeChild(this._img), "" === this._iconName ? this._iconset && this._iconset.removeIcon(this) : this._iconsetName && this._meta && (this._iconset = this._meta.byKey(this._iconsetName), this._iconset ? (this._iconset.applyIcon(this, this._iconName, this.theme), this.unlisten(window, "iron-iconset-added", "_updateIcon")) : this.listen(window, "iron-iconset-added", "_updateIcon"))) : (this._iconset && this._iconset.removeIcon(this), this._img || (this._img = document.createElement("img"), this._img.style.width = "100%", this._img.style.height = "100%", this._img.draggable = !1), this._img.src = this.src, Polymer.dom(this.root).appendChild(this._img))
				}
			}), Polymer.PaperInkyFocusBehaviorImpl = {
				observers: ["_focusedChanged(receivedFocusFromKeyboard)"],
				_focusedChanged: function (e) {
					e && this.ensureRipple(), this.hasRipple() && (this._ripple.holdDown = e)
				},
				_createRipple: function () {
					var e = Polymer.PaperRippleBehavior._createRipple();
					return e.id = "ink", e.setAttribute("center", ""), e.classList.add("circle"), e
				}
			}, Polymer.PaperInkyFocusBehavior = [Polymer.IronButtonState, Polymer.IronControlState, Polymer.PaperRippleBehavior, Polymer.PaperInkyFocusBehaviorImpl], Polymer(
				{
					is: "paper-icon-button",
					hostAttributes:
					{
						role: "button",
						tabindex: "0"
					},
					behaviors: [Polymer.PaperInkyFocusBehavior],
					properties:
					{
						src:
						{
							type: String
						},
						icon:
						{
							type: String
						},
						alt:
						{
							type: String,
							observer: "_altChanged"
						}
					},
					_altChanged: function (e, t) {
						var i = this.getAttribute("aria-label");
						i && t != i || this.setAttribute("aria-label", e)
					}
				}), Polymer(
					{
						is: "iron-iconset-svg",
						properties:
						{
							name:
							{
								type: String,
								observer: "_nameChanged"
							},
							size:
							{
								type: Number,
								value: 24
							},
							rtlMirroring:
							{
								type: Boolean,
								value: !1
							}
						},
						attached: function () {
							this.style.display = "none"
						},
						getIconNames: function () {
							return this._icons = this._createIconMap(), Object.keys(this._icons).map(function (e) {
								return this.name + ":" + e
							}, this)
						},
						applyIcon: function (e, t) {
							e = e.root || e, this.removeIcon(e);
							var i = this._cloneIcon(t, this.rtlMirroring && this._targetIsRTL(e));
							if (i) {
								var n = Polymer.dom(e);
								return n.insertBefore(i, n.childNodes[0]), e._svgIcon = i
							}
							return null
						},
						removeIcon: function (e) {
							(e = e.root || e)._svgIcon && (Polymer.dom(e).removeChild(e._svgIcon), e._svgIcon = null)
						},
						_targetIsRTL: function (e) {
							return null == this.__targetIsRTL && (e && e.nodeType !== Node.ELEMENT_NODE && (e = e.host), this.__targetIsRTL = e && "rtl" === window.getComputedStyle(e).direction), this.__targetIsRTL
						},
						_nameChanged: function () {
							new Polymer.IronMeta(
								{
									type: "iconset",
									key: this.name,
									value: this
								}), this.async(function () {
									this.fire("iron-iconset-added", this,
										{
											node: window
										})
								})
						},
						_createIconMap: function () {
							var t = Object.create(null);
							return Polymer.dom(this).querySelectorAll("[id]").forEach(function (e) {
								t[e.id] = e
							}), t
						},
						_cloneIcon: function (e, t) {
							return this._icons = this._icons || this._createIconMap(), this._prepareSvgClone(this._icons[e], this.size, t)
						},
						_prepareSvgClone: function (e, t, i) {
							if (e) {
								var n = e.cloneNode(!0),
									r = document.createElementNS("http://www.w3.org/2000/svg", "svg"),
									o = n.getAttribute("viewBox") || "0 0 " + t + " " + t,
									s = "pointer-events: none; display: block; width: 100%; height: 100%;";
								return i && n.hasAttribute("mirror-in-rtl") && (s += "-webkit-transform:scale(-1,1);transform:scale(-1,1);"), r.setAttribute("viewBox", o), r.setAttribute("preserveAspectRatio", "xMidYMid meet"), r.setAttribute("focusable", "false"), r.style.cssText = s, r.appendChild(n).removeAttribute("id"), r
							}
							return null
						}
					}), Polymer(
						{
							is: "iron-collapse",
							behaviors: [Polymer.IronResizableBehavior],
							properties:
							{
								horizontal:
								{
									type: Boolean,
									value: !1,
									observer: "_horizontalChanged"
								},
								opened:
								{
									type: Boolean,
									value: !1,
									notify: !0,
									observer: "_openedChanged"
								},
								transitioning:
								{
									type: Boolean,
									notify: !0,
									readOnly: !0
								},
								noAnimation:
								{
									type: Boolean
								},
								_desiredSize:
								{
									type: String,
									value: ""
								}
							},
							get dimension() {
								return this.horizontal ? "width" : "height"
							},
							get _dimensionMax() {
								return this.horizontal ? "maxWidth" : "maxHeight"
							},
							get _dimensionMaxCss() {
								return this.horizontal ? "max-width" : "max-height"
							},
							hostAttributes:
							{
								role: "group",
								"aria-hidden": "true",
								"aria-expanded": "false"
							},
							listeners:
							{
								transitionend: "_onTransitionEnd"
							},
							toggle: function () {
								this.opened = !this.opened
							},
							show: function () {
								this.opened = !0
							},
							hide: function () {
								this.opened = !1
							},
							updateSize: function (e, t) {
								e = "auto" === e ? "" : e;
								var i = t && !this.noAnimation && this.isAttached && this._desiredSize !== e;
								if (this._desiredSize = e, this._updateTransition(!1), i) {
									var n = this._calcSize();
									"" === e && (this.style[this._dimensionMax] = "", e = this._calcSize()), this.style[this._dimensionMax] = n, this.scrollTop = this.scrollTop, this._updateTransition(!0), i = e !== n
								}
								this.style[this._dimensionMax] = e, i || this._transitionEnd()
							},
							enableTransition: function (e) {
								Polymer.Base._warn("`enableTransition()` is deprecated, use `noAnimation` instead."), this.noAnimation = !e
							},
							_updateTransition: function (e) {
								this.style.transitionDuration = e && !this.noAnimation ? "" : "0s"
							},
							_horizontalChanged: function () {
								this.style.transitionProperty = this._dimensionMaxCss;
								var e = "maxWidth" === this._dimensionMax ? "maxHeight" : "maxWidth";
								this.style[e] = "", this.updateSize(this.opened ? "auto" : "0px", !1)
							},
							_openedChanged: function () {
								this.setAttribute("aria-expanded", this.opened), this.setAttribute("aria-hidden", !this.opened), this._setTransitioning(!0), this.toggleClass("iron-collapse-closed", !1), this.toggleClass("iron-collapse-opened", !1), this.updateSize(this.opened ? "auto" : "0px", !0), this.opened && this.focus()
							},
							_transitionEnd: function () {
								this.style[this._dimensionMax] = this._desiredSize, this.toggleClass("iron-collapse-closed", !this.opened), this.toggleClass("iron-collapse-opened", this.opened), this._updateTransition(!1), this.notifyResize(), this._setTransitioning(!1)
							},
							_onTransitionEnd: function (e) {
								Polymer.dom(e).rootTarget === this && this._transitionEnd()
							},
							_calcSize: function () {
								return this.getBoundingClientRect()[this.dimension] + "px"
							}
						}), Polymer(
							{
								is: "testrtc-suite",
								properties:
								{
									state:
									{
										value: "pending",
										reflectToAttribute: !0
									},
									tests:
									{
										type: Array,
										value: function () {
											return []
										}
									}
								},
								_iconForState: function (e) {
									return "failure" === e ? "close" : "warning" === e ? "warning" : "success" === e ? "check" : "running" === e ? "more-horiz" : ""
								},
								toggle: function () {
									this.$.collapse.toggle()
								},
								addTest: function (e, t) {
									var i = document.createElement("testrtc-test");
									i.name = e, i.testFunction = t, Polymer.dom(this.$.collapse).appendChild(i), this.tests.push(i)
								},
								run: function (e) {
									this.opened = !0, this.state = "running", runAllSequentially(this.tests, this.allTestsFinished.bind(this, e))
								},
								allTestsFinished: function (e) {
									for (var t = 0, i = 0, n = 0, r = 0; r !== this.tests.length; ++r) t += this.tests[r].errorCount, i += this.tests[r].warningCount, n += this.tests[r].successCount;
									0 === t && 0 === i && 0 < n ? (this.state = "success", this.opened = !1) : (this.state = 0 === t && 0 < i ? "warning" : "failure", this.opened = !0), e()
								}
							});

var currentTest, PREFIX_INFO = "[   INFO ]",
	PREFIX_OK = "[     OK ]",
	PREFIX_FAILED = "[ FAILED ]",
	PREFIX_WARNING = "[   WARN ]";

function createLineChart() {
	return currentTest.createLineChart()
}

function reportFatal(e) {
	currentTest.reportFatal(e)
}

function setTestProgress(e) {
	currentTest.setProgress(e)
}


function setTimeoutWithProgressBar(e, t) {
	function i() {
		clearInterval(r), setTestProgress(100), e()
	}
	var n = window.performance.now(),
		r = setInterval(function () {
			setTestProgress(100 * (window.performance.now() - n) / t)
		}, 100),
		o = setTimeout(i, t);
	return function () {
		clearTimeout(o), i()
	}
}

function Report() {
	this.output_ = [], this.nextAsyncId_ = 0, this.nativeLog_ = console.log.bind(console), window.addEventListener("error", this.onWindowError_.bind(this)), this.traceEventInstant("system-info", Report.getSystemInfo())
}
Polymer(
	{
		is: "testrtc-test",
		properties:
		{
			name:
			{
				type: String
			},
			testFunction:
			{
				type: Function
			},
			settings:
			{
				type: Object,
				value: function () {
					return {}
				}
			},
			state:
			{
				value: "unknown",
				reflectToAttribute: !0
			},
			progressValue:
			{
				value: null
			},
			output:
			{
				type: Array,
				value: function () {
					return []
				}
			}
		},
		ready: function () {
			this.reportMessage_(PREFIX_INFO, "Test not run yet.")
		},
		_inProgress: function (e) {
			return null !== e
		},
		_iconForState: function (e) {
			return "running" === e ? "more-horiz" : "success" === e ? "check" : "warning" === e ? "warning" : "failure" === e ? "close" : ""
		},
		toggle: function () {
			this.$.collapse.toggle()
		},
		run: function (e) {
			this.settings = document.getElementsByTagName("testrtc-main")[0].settings, this.successCount = 0, this.warningCount = 0, this.errorCount = 0, this.doneCallback_ = e, this.output = [], this.clearPlots(), this.setProgress(null), this.traceTestEvent = report.traceEventAsync("test-run"), (currentTest = this).state = "running", this.traceTestEvent(
				{
					name: this.name,
					status: this.state
				}), this.isDisabled ? (this.reportInfo("Test is disabled."), this.done()) : this.testFunction(this)
		},
		done: function () {
			"running" === this.state && (this.setProgress(null), this.errorCount + this.warningCount === 0 && 0 < this.successCount ? this.state = "success" : 0 < this.warningCount && 0 === this.errorCount ? this.state = "warning" : this.isDisabled ? this.state = "disabled" : this.state = "failure", this.traceTestEvent(
				{
					status: this.state
				}), report.logTestRunResult(this.name, this.state), this.doneCallback_())
		},
		setProgress: function (e) {
			this.progressValue = e
		},
		expectEquals: function (e, t, i, n) {
			e !== t ? this.reportError("Failed expectation: " + e + " !== " + t + ": " + i) : n && this.reportSuccess(n)
		},
		reportSuccess: function (e) {
			this.reportMessage_(PREFIX_OK, e), this.successCount++, this.traceTestEvent(
				{
					success: e
				})
		},
		reportError: function (e) {
			this.reportMessage_(PREFIX_FAILED, e), this.errorCount++, this.traceTestEvent(
				{
					error: e
				})
		},
		reportWarning: function (e) {
			this.reportMessage_(PREFIX_WARNING, e), this.warningCount++, this.traceTestEvent(
				{
					warning: e
				})
		},
		reportInfo: function (e) {
			this.reportMessage_(PREFIX_INFO, e), this.traceTestEvent(
				{
					info: e
				})
		},
		reportFatal: function (e) {
			this.reportError(e), this.done()
		},
		reportMessage_: function (e, t) {
			this.output = [].concat(this.output, [
				{
					prefix: e,
					message: t
				}])
		},
		clearPlots: function () {
			for (; null !== this.$.plot.lastElementChild;) Polymer.dom(this.$.plot).removeChild(this.$.plot.lastElementChild)
		},
		createLineChart: function () {
			var e = document.createElement("line-chart");
			return Polymer.dom(this.$.plot).appendChild(e), this.$.collapse.opened = !0, e
		}
	}), Polymer(
		{
			is: "gum-handler",
			properties:
			{
				pending:
				{
					type: Boolean,
					value: !0,
					notify: !0
				},
				error:
				{
					type: Object,
					value: !1,
					notify: !0
				},
				getUserMedia:
				{
					type: Function,
					value: function () {
						return navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices)
					}
				},
				enumerateDevices:
				{
					type: Function,
					value: function () {
						return navigator.mediaDevices.enumerateDevices.bind(navigator.mediaDevices)
					}
				}
			},
			ready: function () {
				"undefined" !== this.getUserMedia ? this.triggerGetUserMedia_() : this.error = "NotSupported"
			},
			triggerGetUserMedia_: function () {
				0 != this.pending && this.enumerateDevices().then(this.triggerGetUserMediaBasedOnSources_.bind(this)).catch(function (e) {
					console.log("JS Device selection not supported", e), this.triggerGetUserMediaBasedOnSources_([])
				}.bind(this))
			},
			triggerGetUserMediaBasedOnSources_: function (e) {
				var t = {};
				if (0 === e.length) t = {
					audio: !0,
					video: !0
				};
				else
					for (var i = 0; i < e.length; i++) "audioinput" === e[i].kind && (t.audio = !0), "videoinput" === e[i].kind && (t.video = !0);
				this.getUserMedia(t).then(function (e) {
					for (var t = 0; t < e.getVideoTracks().length; t++) e.getVideoTracks()[t].stop();
					for (var i = 0; i < e.getAudioTracks().length; i++) e.getAudioTracks()[i].stop();
					this.pending = !1, this.error = !1
				}.bind(this)).catch(function (e) {
					this.error = e, setTimeout(this.triggerGetUserMedia_.bind(this), 1e3)
				}.bind(this))
			}
		}), Polymer(
			{
				is: "gum-dialog",
				properties:
				{
					pending:
					{
						type: Boolean,
						notify: !0
					},
					heading:
					{
						type: String
					}
				}
			}), Polymer.IronFormElementBehavior = {
				properties:
				{
					name:
					{
						type: String
					},
					value:
					{
						notify: !0,
						type: String
					},
					required:
					{
						type: Boolean,
						value: !1
					},
					_parentForm:
					{
						type: Object
					}
				},
				attached: function () {
					this.fire("iron-form-element-register")
				},
				detached: function () {
					this._parentForm && this._parentForm.fire("iron-form-element-unregister",
						{
							target: this
						})
				}
			},
	function () {
		"use strict";
		Polymer.IronA11yAnnouncer = Polymer(
			{
				is: "iron-a11y-announcer",
				properties:
				{
					mode:
					{
						type: String,
						value: "polite"
					},
					_text:
					{
						type: String,
						value: ""
					}
				},
				created: function () {
					Polymer.IronA11yAnnouncer.instance || (Polymer.IronA11yAnnouncer.instance = this), document.body.addEventListener("iron-announce", this._onIronAnnounce.bind(this))
				},
				announce: function (e) {
					this._text = "", this.async(function () {
						this._text = e
					}, 100)
				},
				_onIronAnnounce: function (e) {
					e.detail && e.detail.text && this.announce(e.detail.text)
				}
			}), Polymer.IronA11yAnnouncer.instance = null, Polymer.IronA11yAnnouncer.requestAvailability = function () {
				Polymer.IronA11yAnnouncer.instance || (Polymer.IronA11yAnnouncer.instance = document.createElement("iron-a11y-announcer")), document.body.appendChild(Polymer.IronA11yAnnouncer.instance)
			}
	}(), Polymer.IronValidatableBehaviorMeta = null, Polymer.IronValidatableBehavior = {
		properties:
		{
			validator:
			{
				type: String
			},
			invalid:
			{
				notify: !0,
				reflectToAttribute: !0,
				type: Boolean,
				value: !1
			},
			_validatorMeta:
			{
				type: Object
			},
			validatorType:
			{
				type: String,
				value: "validator"
			},
			_validator:
			{
				type: Object,
				computed: "__computeValidator(validator)"
			}
		},
		observers: ["_invalidChanged(invalid)"],
		registered: function () {
			Polymer.IronValidatableBehaviorMeta = new Polymer.IronMeta(
				{
					type: "validator"
				})
		},
		_invalidChanged: function () {
			this.invalid ? this.setAttribute("aria-invalid", "true") : this.removeAttribute("aria-invalid")
		},
		hasValidator: function () {
			return null != this._validator
		},
		validate: function (e) {
			return this.invalid = !this._getValidity(e), !this.invalid
		},
		_getValidity: function (e) {
			return !this.hasValidator() || this._validator.validate(e)
		},
		__computeValidator: function () {
			return Polymer.IronValidatableBehaviorMeta && Polymer.IronValidatableBehaviorMeta.byKey(this.validator)
		}
	}, Polymer(
		{
			is: "iron-input",
			extends: "input",
			behaviors: [Polymer.IronValidatableBehavior],
			properties:
			{
				bindValue:
				{
					observer: "_bindValueChanged",
					type: String
				},
				preventInvalidInput:
				{
					type: Boolean
				},
				allowedPattern:
				{
					type: String,
					observer: "_allowedPatternChanged"
				},
				_previousValidInput:
				{
					type: String,
					value: ""
				},
				_patternAlreadyChecked:
				{
					type: Boolean,
					value: !1
				}
			},
			listeners:
			{
				input: "_onInput",
				keypress: "_onKeypress"
			},
			registered: function () {
				this._canDispatchEventOnDisabled() || (this._origDispatchEvent = this.dispatchEvent, this.dispatchEvent = this._dispatchEventFirefoxIE)
			},
			created: function () {
				Polymer.IronA11yAnnouncer.requestAvailability()
			},
			_canDispatchEventOnDisabled: function () {
				var e = document.createElement("input"),
					t = !1;
				e.disabled = !0, e.addEventListener("feature-check-dispatch-event", function () {
					t = !0
				});
				try {
					e.dispatchEvent(new Event("feature-check-dispatch-event"))
				}
				catch (e) { }
				return t
			},
			_dispatchEventFirefoxIE: function (e) {
				var t = this.disabled;
				this.disabled = !1;
				var i = this._origDispatchEvent(e);
				return this.disabled = t, i
			},
			get _patternRegExp() {
				var e;
				if (this.allowedPattern) e = new RegExp(this.allowedPattern);
				else switch (this.type) {
					case "number":
						e = /[0-9.,e-]/
				}
				return e
			},
			ready: function () {
				this.bindValue = this.value
			},
			_bindValueChanged: function () {
				this.value !== this.bindValue && (this.value = this.bindValue || 0 === this.bindValue || !1 === this.bindValue ? this.bindValue : ""), this.fire("bind-value-changed",
					{
						value: this.bindValue
					})
			},
			_allowedPatternChanged: function () {
				this.preventInvalidInput = !!this.allowedPattern
			},
			_onInput: function () {
				this.preventInvalidInput && !this._patternAlreadyChecked && (this._checkPatternValidity() || (this._announceInvalidCharacter("Invalid string of characters not entered."), this.value = this._previousValidInput));
				this.bindValue = this.value, this._previousValidInput = this.value, this._patternAlreadyChecked = !1
			},
			_isPrintable: function (e) {
				var t = 8 == e.keyCode || 9 == e.keyCode || 13 == e.keyCode || 27 == e.keyCode,
					i = 19 == e.keyCode || 20 == e.keyCode || 45 == e.keyCode || 46 == e.keyCode || 144 == e.keyCode || 145 == e.keyCode || 32 < e.keyCode && e.keyCode < 41 || 111 < e.keyCode && e.keyCode < 124;
				return !(t || 0 == e.charCode && i)
			},
			_onKeypress: function (e) {
				if (this.preventInvalidInput || "number" === this.type) {
					var t = this._patternRegExp;
					if (t && !(e.metaKey || e.ctrlKey || e.altKey)) {
						this._patternAlreadyChecked = !0;
						var i = String.fromCharCode(e.charCode);
						this._isPrintable(e) && !t.test(i) && (e.preventDefault(), this._announceInvalidCharacter("Invalid character " + i + " not entered."))
					}
				}
			},
			_checkPatternValidity: function () {
				var e = this._patternRegExp;
				if (!e) return !0;
				for (var t = 0; t < this.value.length; t++)
					if (!e.test(this.value[t])) return !1;
				return !0
			},
			validate: function () {
				var e = this.checkValidity();
				return e && (this.required && "" === this.value ? e = !1 : this.hasValidator() && (e = Polymer.IronValidatableBehavior.validate.call(this, this.value))), this.invalid = !e, this.fire("iron-input-validate"), e
			},
			_announceInvalidCharacter: function (e) {
				this.fire("iron-announce",
					{
						text: e
					})
			}
		}), Polymer.PaperInputHelper = {}, Polymer.PaperInputHelper.NextLabelID = 1, Polymer.PaperInputHelper.NextAddonID = 1, Polymer.PaperInputHelper.NextInputID = 1, Polymer.PaperInputBehaviorImpl = {
			properties:
			{
				label:
				{
					type: String
				},
				value:
				{
					notify: !0,
					type: String
				},
				disabled:
				{
					type: Boolean,
					value: !1
				},
				invalid:
				{
					type: Boolean,
					value: !1,
					notify: !0
				},
				preventInvalidInput:
				{
					type: Boolean
				},
				allowedPattern:
				{
					type: String
				},
				type:
				{
					type: String
				},
				list:
				{
					type: String
				},
				pattern:
				{
					type: String
				},
				required:
				{
					type: Boolean,
					value: !1
				},
				errorMessage:
				{
					type: String
				},
				charCounter:
				{
					type: Boolean,
					value: !1
				},
				noLabelFloat:
				{
					type: Boolean,
					value: !1
				},
				alwaysFloatLabel:
				{
					type: Boolean,
					value: !1
				},
				autoValidate:
				{
					type: Boolean,
					value: !1
				},
				validator:
				{
					type: String
				},
				autocomplete:
				{
					type: String,
					value: "off"
				},
				autofocus:
				{
					type: Boolean,
					observer: "_autofocusChanged"
				},
				inputmode:
				{
					type: String
				},
				minlength:
				{
					type: Number
				},
				maxlength:
				{
					type: Number
				},
				min:
				{
					type: String
				},
				max:
				{
					type: String
				},
				step:
				{
					type: String
				},
				name:
				{
					type: String
				},
				placeholder:
				{
					type: String,
					value: ""
				},
				readonly:
				{
					type: Boolean,
					value: !1
				},
				size:
				{
					type: Number
				},
				autocapitalize:
				{
					type: String,
					value: "none"
				},
				autocorrect:
				{
					type: String,
					value: "off"
				},
				autosave:
				{
					type: String
				},
				results:
				{
					type: Number
				},
				accept:
				{
					type: String
				},
				multiple:
				{
					type: Boolean
				},
				_ariaDescribedBy:
				{
					type: String,
					value: ""
				},
				_ariaLabelledBy:
				{
					type: String,
					value: ""
				},
				_inputId:
				{
					type: String,
					value: ""
				}
			},
			listeners:
			{
				"addon-attached": "_onAddonAttached"
			},
			keyBindings:
			{
				"shift+tab:keydown": "_onShiftTabDown"
			},
			hostAttributes:
			{
				tabindex: 0
			},
			get inputElement() {
				return this.$ || (this.$ = {}), this.$.input || (this._generateInputId(), this.$.input = this.$$("#" + this._inputId)), this.$.input
			},
			get _focusableElement() {
				return this.inputElement
			},
			registered: function () {
				this._typesThatHaveText = ["date", "datetime", "datetime-local", "month", "time", "week", "file"]
			},
			attached: function () {
				this._updateAriaLabelledBy(), this.inputElement && -1 !== this._typesThatHaveText.indexOf(this.inputElement.type) && (this.alwaysFloatLabel = !0)
			},
			_appendStringWithSpace: function (e, t) {
				return e = e ? e + " " + t : t
			},
			_onAddonAttached: function (e) {
				var t = e.path ? e.path[0] : e.target;
				if (t.id) this._ariaDescribedBy = this._appendStringWithSpace(this._ariaDescribedBy, t.id);
				else {
					var i = "paper-input-add-on-" + Polymer.PaperInputHelper.NextAddonID++;
					t.id = i, this._ariaDescribedBy = this._appendStringWithSpace(this._ariaDescribedBy, i)
				}
			},
			validate: function () {
				return this.inputElement.validate()
			},
			_focusBlurHandler: function (e) {
				Polymer.IronControlState._focusBlurHandler.call(this, e), this.focused && !this._shiftTabPressed && this._focusableElement && this._focusableElement.focus()
			},
			_onShiftTabDown: function (e) {
				var t = this.getAttribute("tabindex");
				this._shiftTabPressed = !0, this.setAttribute("tabindex", "-1"), this.async(function () {
					this.setAttribute("tabindex", t), this._shiftTabPressed = !1
				}, 1)
			},
			_handleAutoValidate: function () {
				this.autoValidate && this.validate()
			},
			updateValueAndPreserveCaret: function (t) {
				try {
					var e = this.inputElement.selectionStart;
					this.value = t, this.inputElement.selectionStart = e, this.inputElement.selectionEnd = e
				}
				catch (e) {
					this.value = t
				}
			},
			_computeAlwaysFloatLabel: function (e, t) {
				return t || e
			},
			_updateAriaLabelledBy: function () {
				var e, t = Polymer.dom(this.root).querySelector("label");
				t ? (t.id ? e = t.id : (e = "paper-input-label-" + Polymer.PaperInputHelper.NextLabelID++, t.id = e), this._ariaLabelledBy = e) : this._ariaLabelledBy = ""
			},
			_generateInputId: function () {
				this._inputId && "" !== this._inputId || (this._inputId = "input-" + Polymer.PaperInputHelper.NextInputID++)
			},
			_onChange: function (e) {
				this.shadowRoot && this.fire(e.type,
					{
						sourceEvent: e
					},
					{
						node: this,
						bubbles: e.bubbles,
						cancelable: e.cancelable
					})
			},
			_autofocusChanged: function () {
				if (this.autofocus && this._focusableElement) {
					var e = document.activeElement;
					e instanceof HTMLElement && e !== document.body && e !== document.documentElement || this._focusableElement.focus()
				}
			}
		}, Polymer.PaperInputBehavior = [Polymer.IronControlState, Polymer.IronA11yKeysBehavior, Polymer.PaperInputBehaviorImpl], Polymer.PaperInputAddonBehavior = {
			hostAttributes:
			{
				"add-on": ""
			},
			attached: function () {
				this.fire("addon-attached")
			},
			update: function (e) { }
		}, Polymer(
			{
				is: "paper-input-char-counter",
				behaviors: [Polymer.PaperInputAddonBehavior],
				properties:
				{
					_charCounterStr:
					{
						type: String,
						value: "0"
					}
				},
				update: function (e) {
					if (e.inputElement) {
						e.value = e.value || "";
						var t = e.value.toString().length.toString();
						e.inputElement.hasAttribute("maxlength") && (t += "/" + e.inputElement.getAttribute("maxlength")), this._charCounterStr = t
					}
				}
			}), Polymer(
				{
					is: "paper-input-container",
					properties:
					{
						noLabelFloat:
						{
							type: Boolean,
							value: !1
						},
						alwaysFloatLabel:
						{
							type: Boolean,
							value: !1
						},
						attrForValue:
						{
							type: String,
							value: "bind-value"
						},
						autoValidate:
						{
							type: Boolean,
							value: !1
						},
						invalid:
						{
							observer: "_invalidChanged",
							type: Boolean,
							value: !1
						},
						focused:
						{
							readOnly: !0,
							type: Boolean,
							value: !1,
							notify: !0
						},
						_addons:
						{
							type: Array
						},
						_inputHasContent:
						{
							type: Boolean,
							value: !1
						},
						_inputSelector:
						{
							type: String,
							value: "input,textarea,.paper-input-input"
						},
						_boundOnFocus:
						{
							type: Function,
							value: function () {
								return this._onFocus.bind(this)
							}
						},
						_boundOnBlur:
						{
							type: Function,
							value: function () {
								return this._onBlur.bind(this)
							}
						},
						_boundOnInput:
						{
							type: Function,
							value: function () {
								return this._onInput.bind(this)
							}
						},
						_boundValueChanged:
						{
							type: Function,
							value: function () {
								return this._onValueChanged.bind(this)
							}
						}
					},
					listeners:
					{
						"addon-attached": "_onAddonAttached",
						"iron-input-validate": "_onIronInputValidate"
					},
					get _valueChangedEvent() {
						return this.attrForValue + "-changed"
					},
					get _propertyForValue() {
						return Polymer.CaseMap.dashToCamelCase(this.attrForValue)
					},
					get _inputElement() {
						return Polymer.dom(this).querySelector(this._inputSelector)
					},
					get _inputElementValue() {
						return this._inputElement[this._propertyForValue] || this._inputElement.value
					},
					ready: function () {
						this._addons || (this._addons = []), this.addEventListener("focus", this._boundOnFocus, !0), this.addEventListener("blur", this._boundOnBlur, !0)
					},
					attached: function () {
						this.attrForValue ? this._inputElement.addEventListener(this._valueChangedEvent, this._boundValueChanged) : this.addEventListener("input", this._onInput), "" != this._inputElementValue ? this._handleValueAndAutoValidate(this._inputElement) : this._handleValue(this._inputElement)
					},
					_onAddonAttached: function (e) {
						this._addons || (this._addons = []);
						var t = e.target; - 1 === this._addons.indexOf(t) && (this._addons.push(t), this.isAttached && this._handleValue(this._inputElement))
					},
					_onFocus: function () {
						this._setFocused(!0)
					},
					_onBlur: function () {
						this._setFocused(!1), this._handleValueAndAutoValidate(this._inputElement)
					},
					_onInput: function (e) {
						this._handleValueAndAutoValidate(e.target)
					},
					_onValueChanged: function (e) {
						this._handleValueAndAutoValidate(e.target)
					},
					_handleValue: function (e) {
						var t = this._inputElementValue;
						t || 0 === t || "number" === e.type && !e.checkValidity() ? this._inputHasContent = !0 : this._inputHasContent = !1, this.updateAddons(
							{
								inputElement: e,
								value: t,
								invalid: this.invalid
							})
					},
					_handleValueAndAutoValidate: function (e) {
						var t;
						this.autoValidate && (t = e.validate ? e.validate(this._inputElementValue) : e.checkValidity(), this.invalid = !t);
						this._handleValue(e)
					},
					_onIronInputValidate: function (e) {
						this.invalid = this._inputElement.invalid
					},
					_invalidChanged: function () {
						this._addons && this.updateAddons(
							{
								invalid: this.invalid
							})
					},
					updateAddons: function (e) {
						for (var t, i = 0; t = this._addons[i]; i++) t.update(e)
					},
					_computeInputContentClass: function (e, t, i, n, r) {
						var o = "input-content";
						if (e) r && (o += " label-is-hidden"), n && (o += " is-invalid");
						else {
							var s = this.querySelector("label");
							t || r ? (o += " label-is-floating", this.$.labelAndInputContainer.style.position = "static", n ? o += " is-invalid" : i && (o += " label-is-highlighted")) : (s && (this.$.labelAndInputContainer.style.position = "relative"), n && (o += " is-invalid"))
						}
						return i && (o += " focused"), o
					},
					_computeUnderlineClass: function (e, t) {
						var i = "underline";
						return t ? i += " is-invalid" : e && (i += " is-highlighted"), i
					},
					_computeAddOnContentClass: function (e, t) {
						var i = "add-on-content";
						return t ? i += " is-invalid" : e && (i += " is-highlighted"), i
					}
				}), Polymer(
					{
						is: "paper-input-error",
						behaviors: [Polymer.PaperInputAddonBehavior],
						properties:
						{
							invalid:
							{
								readOnly: !0,
								reflectToAttribute: !0,
								type: Boolean
							}
						},
						update: function (e) {
							this._setInvalid(e.invalid)
						}
					}), Polymer(
						{
							is: "paper-input",
							behaviors: [Polymer.IronFormElementBehavior, Polymer.PaperInputBehavior]
						}), Polymer(
							{
								is: "iron-autogrow-textarea",
								behaviors: [Polymer.IronFormElementBehavior, Polymer.IronValidatableBehavior, Polymer.IronControlState],
								properties:
								{
									bindValue:
									{
										observer: "_bindValueChanged",
										type: String
									},
									rows:
									{
										type: Number,
										value: 1,
										observer: "_updateCached"
									},
									maxRows:
									{
										type: Number,
										value: 0,
										observer: "_updateCached"
									},
									autocomplete:
									{
										type: String,
										value: "off"
									},
									autofocus:
									{
										type: Boolean,
										value: !1
									},
									inputmode:
									{
										type: String
									},
									placeholder:
									{
										type: String
									},
									readonly:
									{
										type: String
									},
									required:
									{
										type: Boolean
									},
									minlength:
									{
										type: Number
									},
									maxlength:
									{
										type: Number
									}
								},
								listeners:
								{
									input: "_onInput"
								},
								observers: ["_onValueChanged(value)"],
								get textarea() {
									return this.$.textarea
								},
								get selectionStart() {
									return this.$.textarea.selectionStart
								},
								get selectionEnd() {
									return this.$.textarea.selectionEnd
								},
								set selectionStart(e) {
									this.$.textarea.selectionStart = e
								},
								set selectionEnd(e) {
									this.$.textarea.selectionEnd = e
								},
								attached: function () {
									navigator.userAgent.match(/iP(?:[oa]d|hone)/) && !navigator.userAgent.match(/OS 1[3456789]/) && (this.$.textarea.style.marginLeft = "-3px")
								},
								validate: function () {
									return this.required || "" != this.value ? (this.hasValidator() ? e = Polymer.IronValidatableBehavior.validate.call(this, this.value) : (e = this.$.textarea.validity.valid, this.invalid = !e), this.fire("iron-input-validate"), e) : !(this.invalid = !1);
									var e
								},
								_bindValueChanged: function () {
									var e = this.textarea;
									e && (e.value !== this.bindValue && (e.value = this.bindValue || 0 === this.bindValue ? this.bindValue : ""), this.value = this.bindValue, this.$.mirror.innerHTML = this._valueForMirror(), this.fire("bind-value-changed",
										{
											value: this.bindValue
										}))
								},
								_onInput: function (e) {
									this.bindValue = e.path ? e.path[0].value : e.target.value
								},
								_constrain: function (e) {
									var t;
									for (e = e || [""], t = 0 < this.maxRows && e.length > this.maxRows ? e.slice(0, this.maxRows) : e.slice(0); 0 < this.rows && t.length < this.rows;) t.push("");
									return t.join("<br/>") + "&#160;"
								},
								_valueForMirror: function () {
									var e = this.textarea;
									if (e) return this.tokens = e && e.value ? e.value.replace(/&/gm, "&amp;").replace(/"/gm, "&quot;").replace(/'/gm, "&#39;").replace(/</gm, "&lt;").replace(/>/gm, "&gt;").split("\n") : [""], this._constrain(this.tokens)
								},
								_updateCached: function () {
									this.$.mirror.innerHTML = this._constrain(this.tokens)
								},
								_onValueChanged: function () {
									this.bindValue = this.value
								}
							}), Polymer(
								{
									is: "paper-textarea",
									behaviors: [Polymer.PaperInputBehavior, Polymer.IronFormElementBehavior],
									properties:
									{
										_ariaLabelledBy:
										{
											observer: "_ariaLabelledByChanged",
											type: String
										},
										_ariaDescribedBy:
										{
											observer: "_ariaDescribedByChanged",
											type: String
										},
										rows:
										{
											type: Number,
											value: 1
										},
										maxRows:
										{
											type: Number,
											value: 0
										}
									},
									_ariaLabelledByChanged: function (e) {
										this._focusableElement.setAttribute("aria-labelledby", e)
									},
									_ariaDescribedByChanged: function (e) {
										this._focusableElement.setAttribute("aria-describedby", e)
									},
									get _focusableElement() {
										return this.inputElement.textarea
									}
								}), Report.prototype = {
									traceEventInstant: function (e, t) {
										this.output_.push(
											{
												ts: Date.now(),
												name: e,
												args: t
											})
									},
									traceEventWithId: function (e, t, i) {
										this.output_.push(
											{
												ts: Date.now(),
												name: e,
												id: t,
												args: i
											})
									},
									traceEventAsync: function (e) {
										return this.traceEventWithId.bind(this, e, this.nextAsyncId_++)
									},
									logTestRunResult: function (e, t) {
										ga("send",
											{
												hitType: "event",
												eventCategory: "Test",
												eventAction: t,
												eventLabel: e,
												nonInteraction: 1
											})
									},
									generate: function (e) {
										var t = {
											title: "WebRTC Troubleshooter bug report",
											description: e || null
										};
										return this.getContent_(t)
									},
									getContent_: function (e) {
										var t = [];
										return this.appendEventsAsString_([e], t), this.appendEventsAsString_(this.output_, t), "[" + t.join(",\n") + "]"
									},
									appendEventsAsString_: function (e, t) {
										for (var i = 0; i !== e.length; ++i) t.push(JSON.stringify(e[i]))
									},
									onWindowError_: function (e) {
										this.traceEventInstant("error",
											{
												message: e.message,
												filename: e.filename + ":" + e.lineno
											})
									},
								}, Report.getSystemInfo = function () {
									var e, t, i, n = navigator.userAgent,
										r = navigator.appName,
										o = "" + parseFloat(navigator.appVersion);
									return -1 !== (t = n.indexOf("Chrome")) ? (r = "Chrome", o = n.substring(t + 7)) : -1 !== (t = n.indexOf("MSIE")) ? (r = "Microsoft Internet Explorer", o = n.substring(t + 5)) : -1 !== (t = n.indexOf("Trident")) ? (r = "Microsoft Internet Explorer", o = n.substring(t + 8)) : -1 !== (t = n.indexOf("Firefox")) ? r = "Firefox" : -1 !== (t = n.indexOf("Safari")) ? (r = "Safari", o = n.substring(t + 7), -1 !== (t = n.indexOf("Version")) && (o = n.substring(t + 8))) : (e = n.lastIndexOf(" ") + 1) < (t = n.lastIndexOf("/")) && (r = n.substring(e, t), o = n.substring(t + 1), r.toLowerCase() === r.toUpperCase() && (r = navigator.appName)), -1 !== (i = o.indexOf(";")) && (o = o.substring(0, i)), -1 !== (i = o.indexOf(" ")) && (o = o.substring(0, i)),
									{
										browserName: r,
										browserVersion: o,
										platform: navigator.platform
									}
								};
var report = new Report;

function parseUrlParameters() {
	var e = {};
	if ("" !== window.location.search)
		for (var t = window.location.search.replace(/\//g, "").substr(1).split("&"), i = 0; i !== t.length; ++i) {
			var n = t[i].split("=");
			e[decodeURIComponent(n[0])] = decodeURIComponent(n[1])
		}
	return e
}
Polymer(
	{
		is: "report-dialog",
		open: function () {
			window.a = this.$.mainDialog, this.$.mainDialog.open()
		},
		download: function () {
			var e = report.generate(this.description),
				t = encodeURIComponent(e),
				i = document.createElement("a");
			i.setAttribute("href", "data:text/plain;charset=utf-8," + t), i.setAttribute("download", "testrtc-" + (new Date).toJSON() + ".log"), i.click()
		},
		upload: function () {
			this.submitting = !0;
			var e = new XMLHttpRequest;
			e.open("HEAD", "/report/new", !0), e.addEventListener("load", this.onGetUploadUrl_.bind(this), !1), e.send(null)
		},
		onGetUploadUrl_: function (e) {
			if (200 === e.currentTarget.status) {
				var t = "testrtc-" + (new Date).toJSON() + ".log",
					i = report.generate(this.description),
					n = new Blob([i],
						{
							type: "text/plain"
						}),
					r = new FormData;
				r.append(t, n, t);
				var o = e.currentTarget.getResponseHeader("response-text"),
					s = new XMLHttpRequest;
				s.open("POST", o, !0), s.setRequestHeader("X-File-Name", t), s.addEventListener("load", this.onUploadFile_.bind(this), !1), s.send(r)
			}
			else this.reportError = e.currentTarget.status, report.traceEventInstant("log-error",
				{
					error: this.reportError
				}), this.$.failure.open()
		},
		onUploadFile_: function (e) {
			200 === e.currentTarget.status ? (this.reportUrl = e.currentTarget.getResponseHeader("response-text"), report.traceEventInstant("log-uploaded",
				{
					url: this.reportUrl
				}), this.$.success.open()) : (this.reportError = e.currentTarget.status, report.traceEventInstant("log-error",
					{
						error: this.reportError
					}), this.$.failure.open())
		},
		closeFail: function () {
			this.submitting = !1
		},
		closeSuccess: function () {
			this.submitting = !1, this.description = "", this.$.mainDialog.close()
		}
	}),

	Polymer(
		{
			is: "testrtc-main",
			properties:
			{
				settings:
				{
					type: Object,
					value: function () {
						return parseUrlParameters()
					}
				}
			},
			_updateLink: function () {
				var e = window.location,
					t = [];
				for (var i in this.settings) "" !== this.settings[i] && t.push(encodeURIComponent(i) + "=" + encodeURIComponent(this.settings[i]));
				var n = 0 != t.length ? "?" + t.join("&") : "";
				this._link = e.protocol + "//" + e.host + e.pathname + n
			},
			observers: ["_pendingChanged(pending)", "_updateLink(settings.*)"],
			listeners:
			{
				"bug-report": "openBugReport"
			},
			_pendingChanged: function (e) {
				// console.error("Get device",e)
				document.getElementById("connowcam").click();
				this.traceEnumDevice = report.traceEventAsync("enumerateDevices"), adapter.disableLog(!0), !1 === e && (navigator.mediaDevices.enumerateDevices().then(this.gotSources.bind(this)).catch(function (e) {
					console.log("JS Device selection not supported", e)
				}),
					window.doGetUserMedia = this.doGetUserMedia.bind(this), this.$.startButton.click())
			},
			gotSources: function (e) {
				for (var t = 0; t !== e.length; ++t) {
					var i = e[t],
						n = document.createElement("option");
					n.value = i.deviceId, this.appendOption(i, n)
				}
			},
			appendOption: function (e, t) {
				"audioinput" === e.kind ? (t.text = e.label || "microphone " + (this.$.audioSource.length + 1), this.$.audioSource.appendChild(t)) : "videoinput" === e.kind ? (t.text = e.label || "camera " + (this.$.videoSource.length + 1), this.$.videoSource.appendChild(t)) : this.traceEnumDevice("Some other kind of source: " + e.kind)
			},
			doGetUserMedia: function (e, n, t) {
				var r = this,
					o = report.traceEventAsync("getusermedia");
				try {
					this.appendSourceId(this.$.audioSource.value, "audio", e), this.appendSourceId(this.$.videoSource.value, "video", e), o(
						{
							status: "pending",
							constraints: e
						}), navigator.mediaDevices.getUserMedia(e).then(function (e) {
							var t = r.getDeviceName_(e.getVideoTracks()),
								i = r.getDeviceName_(e.getAudioTracks());
							o(
								{
									status: "success",
									camera: t,
									microphone: i
								}), n.apply(this, arguments)
						}).catch(function (e) {
							o(
								{
									status: "fail",
									error: e
								}), t ? t.apply(this, arguments) : reportFatal("Failed to get access to local media due to error: " + e)

							t ? Mic(true) : Mic(false);
						})
				}
				catch (e) {
					return console.log(e), o(
						{
							status: "exception",
							error: e.message
						}), reportFatal("getUserMedia failed with exception: " + e.message)
				}
			},
			appendSourceId: function (e, t, i) {
				!0 === i[t] ? i[t] = {
					optional: [
						{
							sourceId: e
						}]
				} : "object" == typeof i[t] && (void 0 === i[t].optional && (i[t].optional = []), i[t].optional.push(
					{
						sourceId: e
					}))
			},
			getDeviceName_: function (e) {
				return 0 === e.length ? null : e[0].label
			},
			run: function () {
				// console.debug("Start ===============================================");
				Refresh(true);
				runAllSequentially(enumeratedTestSuites, function () {
					Refresh(false);
					// console.debug("End ===============================================");
				})
			},
			openBugReport: function () {
				this.pending = !1, this.$.bugreport.open()
			},
			openSettingsDialog: function () {
				this.$.settings.open()
			}
		});
var enumeratedTestSuites = [],
	enumeratedTestFilters = [];

function addTest(e, t, i) {
	if (!isTestDisabled(t)) {
		for (var n = 0; n !== enumeratedTestSuites.length; ++n)
			if (enumeratedTestSuites[n].name === e) return void enumeratedTestSuites[n].addTest(t, i);
		var r = document.createElement("testrtc-suite");
		r.name = e, r.addTest(t, i), enumeratedTestSuites.push(r), document.getElementById("content").appendChild(r)
	}
}


function isTestDisabled(e) {
	return 0 !== enumeratedTestFilters.length && !isTestExplicitlyEnabled(e)
}

function isTestExplicitlyEnabled(e) {
	for (var t = 0; t !== enumeratedTestFilters.length; ++t)
		if (enumeratedTestFilters[t] === e) return !0;
	return !1
}
var parameters = parseUrlParameters(),
	filterParameterName = "test_filter";

function Call(e, t) {
	this.test = t, this.traceEvent = report.traceEventAsync("call"), this.traceEvent(
		{
			config: e
		}), this.statsGatheringRunning = !1, this.pc1 = new RTCPeerConnection(e), this.pc2 = new RTCPeerConnection(e), this.pc1.addEventListener("icecandidate", this.onIceCandidate_.bind(this, this.pc2)), this.pc2.addEventListener("icecandidate", this.onIceCandidate_.bind(this, this.pc1)), this.iceCandidateFilter_ = Call.noFilter
}

function StatisticsAggregate(e) {
	this.startTime_ = 0, this.sum_ = 0, this.count_ = 0, this.max_ = 0, this.rampUpThreshold_ = e, this.rampUpTime_ = 1 / 0
}

function Ssim() { }

function VideoFrameChecker(e) {
	this.frameStats = {
		numFrozenFrames: 0,
		numBlackFrames: 0,
		numFrames: 0
	}, this.running_ = !0, this.nonBlackPixelLumaThreshold = 20, this.previousFrame_ = [], this.identicalFrameSsimThreshold = .985, this.frameComparator = new Ssim, this.canvas_ = document.createElement("canvas"), this.videoElement_ = e, this.listener_ = this.checkVideoFrame_.bind(this), this.videoElement_.addEventListener("play", this.listener_, !1)
}

function arrayAverage(e) {
	for (var t = e.length, i = 0, n = 0; n < t; n++) i += e[n];
	return Math.floor(i / t)
}

function arrayMax(e) {
	return 0 === e.length ? NaN : Math.max.apply(Math, e)
}

function arrayMin(e) {
	return 0 === e.length ? NaN : Math.min.apply(Math, e)
}

function enumerateStats(e, i, n) {
	var r = {
		audio:
		{
			local:
			{
				audioLevel: 0,
				bytesSent: 0,
				clockRate: 0,
				codecId: "",
				mimeType: "",
				packetsSent: 0,
				payloadType: 0,
				timestamp: 0,
				trackId: "",
				transportId: ""
			},
			remote:
			{
				audioLevel: 0,
				bytesReceived: 0,
				clockRate: 0,
				codecId: "",
				fractionLost: 0,
				jitter: 0,
				mimeType: "",
				packetsLost: -1,
				packetsReceived: 0,
				payloadType: 0,
				timestamp: 0,
				trackId: "",
				transportId: ""
			}
		},
		video:
		{
			local:
			{
				bytesSent: 0,
				clockRate: 0,
				codecId: "",
				firCount: 0,
				framesEncoded: 0,
				frameHeight: 0,
				framesSent: -1,
				frameWidth: 0,
				nackCount: 0,
				packetsSent: -1,
				payloadType: 0,
				pliCount: 0,
				qpSum: 0,
				timestamp: 0,
				trackId: "",
				transportId: ""
			},
			remote:
			{
				bytesReceived: -1,
				clockRate: 0,
				codecId: "",
				firCount: -1,
				fractionLost: 0,
				frameHeight: 0,
				framesDecoded: 0,
				framesDropped: 0,
				framesReceived: 0,
				frameWidth: 0,
				nackCount: -1,
				packetsLost: -1,
				packetsReceived: 0,
				payloadType: 0,
				pliCount: -1,
				qpSum: 0,
				timestamp: 0,
				trackId: "",
				transportId: ""
			}
		},
		connection:
		{
			availableOutgoingBitrate: 0,
			bytesReceived: 0,
			bytesSent: 0,
			consentRequestsSent: 0,
			currentRoundTripTime: 0,
			localCandidateId: "",
			localCandidateType: "",
			localIp: "",
			localPort: 0,
			localPriority: 0,
			localProtocol: "",
			remoteCandidateId: "",
			remoteCandidateType: "",
			remoteIp: "",
			remotePort: 0,
			remotePriority: 0,
			remoteProtocol: "",
			requestsReceived: 0,
			requestsSent: 0,
			responsesReceived: 0,
			responsesSent: 0,
			timestamp: 0,
			totalRoundTripTime: 0
		}
	};
	return e && (e.forEach(function (e, t) {
		switch (e.type) {
			case "outbound-rtp":
				e.hasOwnProperty("trackId") && (1 !== e.trackId.indexOf(i.audio) & "" !== i.audio ? (r.audio.local.bytesSent = e.bytesSent, r.audio.local.codecId = e.codecId, r.audio.local.packetsSent = e.packetsSent, r.audio.local.timestamp = e.timestamp, r.audio.local.trackId = e.trackId, r.audio.local.transportId = e.transportId) : 1 !== e.trackId.indexOf(i.video) & "" !== i.video && (r.video.local.bytesSent = e.bytesSent, r.video.local.codecId = e.codecId, r.video.local.firCount = e.firCount, r.video.local.framesEncoded = e.framesEncoded, r.video.local.framesSent = e.framesSent, r.video.local.packetsSent = e.packetsSent, r.video.local.pliCount = e.pliCount, r.video.local.qpSum = e.qpSum, r.video.local.timestamp = e.timestamp, r.video.local.trackId = e.trackId, r.video.local.transportId = e.transportId));
				break;
			case "inbound-rtp":
				e.hasOwnProperty("trackId") && (1 !== e.trackId.indexOf(n.audio) & "" !== n.audio && (r.audio.remote.bytesReceived = e.bytesReceived, r.audio.remote.codecId = e.codecId, r.audio.remote.fractionLost = e.fractionLost, r.audio.remote.jitter = e.jitter, r.audio.remote.packetsLost = e.packetsLost, r.audio.remote.packetsReceived = e.packetsReceived, r.audio.remote.timestamp = e.timestamp, r.audio.remote.trackId = e.trackId, r.audio.remote.transportId = e.transportId), 1 !== e.trackId.indexOf(n.video) & "" !== n.video && (r.video.remote.bytesReceived = e.bytesReceived, r.video.remote.codecId = e.codecId, r.video.remote.firCount = e.firCount, r.video.remote.fractionLost = e.fractionLost, r.video.remote.nackCount = e.nackCount, r.video.remote.packetsLost = e.packetsLost, r.video.remote.packetsReceived = e.packetsReceived, r.video.remote.pliCount = e.pliCount, r.video.remote.qpSum = e.qpSum, r.video.remote.timestamp = e.timestamp, r.video.remote.trackId = e.trackId, r.video.remote.transportId = e.transportId));
				break;
			case "candidate-pair":
				e.hasOwnProperty("availableOutgoingBitrate") && (r.connection.availableOutgoingBitrate = e.availableOutgoingBitrate, r.connection.bytesReceived = e.bytesReceived, r.connection.bytesSent = e.bytesSent, r.connection.consentRequestsSent = e.consentRequestsSent, r.connection.currentRoundTripTime = e.currentRoundTripTime, r.connection.localCandidateId = e.localCandidateId, r.connection.remoteCandidateId = e.remoteCandidateId, r.connection.requestsReceived = e.requestsReceived, r.connection.requestsSent = e.requestsSent, r.connection.responsesReceived = e.responsesReceived, r.connection.responsesSent = e.responsesSent, r.connection.timestamp = e.timestamp, r.connection.totalRoundTripTime = e.totalRoundTripTime);
				break;
			default:
				return
		}
	}.bind()), e.forEach(function (e) {
		switch (e.type) {
			case "track":
				e.hasOwnProperty("trackIdentifier") && (1 !== e.trackIdentifier.indexOf(i.video) & "" !== i.video && (r.video.local.frameHeight = e.frameHeight, r.video.local.framesSent = e.framesSent, r.video.local.frameWidth = e.frameWidth), 1 !== e.trackIdentifier.indexOf(n.video) & "" !== n.video && (r.video.remote.frameHeight = e.frameHeight, r.video.remote.framesDecoded = e.framesDecoded, r.video.remote.framesDropped = e.framesDropped, r.video.remote.framesReceived = e.framesReceived, r.video.remote.frameWidth = e.frameWidth), 1 !== e.trackIdentifier.indexOf(i.audio) & "" !== i.audio && (r.audio.local.audioLevel = e.audioLevel), 1 !== e.trackIdentifier.indexOf(n.audio) & "" !== n.audio && (r.audio.remote.audioLevel = e.audioLevel));
				break;
			case "codec":
				e.hasOwnProperty("id") && (1 !== e.id.indexOf(r.audio.local.codecId) & "" !== i.audio && (r.audio.local.clockRate = e.clockRate, r.audio.local.mimeType = e.mimeType, r.audio.local.payloadType = e.payloadType), 1 !== e.id.indexOf(r.audio.remote.codecId) & "" !== n.audio && (r.audio.remote.clockRate = e.clockRate, r.audio.remote.mimeType = e.mimeType, r.audio.remote.payloadType = e.payloadType), 1 !== e.id.indexOf(r.video.local.codecId) & "" !== i.video && (r.video.local.clockRate = e.clockRate, r.video.local.mimeType = e.mimeType, r.video.local.payloadType = e.payloadType), 1 !== e.id.indexOf(r.video.remote.codecId) & "" !== n.video && (r.video.remote.clockRate = e.clockRate, r.video.remote.mimeType = e.mimeType, r.video.remote.payloadType = e.payloadType));
				break;
			case "local-candidate":
				e.hasOwnProperty("id") && -1 !== e.id.indexOf(r.connection.localCandidateId) && (r.connection.localIp = e.ip, r.connection.localPort = e.port, r.connection.localPriority = e.priority, r.connection.localProtocol = e.protocol, r.connection.localType = e.candidateType);
				break;
			case "remote-candidate":
				e.hasOwnProperty("id") && -1 !== e.id.indexOf(r.connection.remoteCandidateId) && (r.connection.remoteIp = e.ip, r.connection.remotePort = e.port, r.connection.remotePriority = e.priority, r.connection.remoteProtocol = e.protocol, r.connection.remoteType = e.candidateType);
				break;
			default:
				return
		}
	}.bind())), r
}


filterParameterName in parameters && (enumeratedTestFilters = parameters[filterParameterName].split(",")), Call.prototype = {
	establishConnection: function () {
		this.traceEvent(
			{
				state: "start"
			}), this.pc1.createOffer().then(this.gotOffer_.bind(this), this.test.reportFatal.bind(this.test))
	},
	close: function () {
		this.traceEvent(
			{
				state: "end"
			}), this.pc1.close(), this.pc2.close()
	},
	setIceCandidateFilter: function (e) {
		this.iceCandidateFilter_ = e
	},
	constrainVideoBitrate: function (e) {
		this.constrainVideoBitrateKbps_ = e
	},
	disableVideoFec: function () {
		this.constrainOfferToRemoveVideoFec_ = !0
	},
	gatherStats: function (e, t, i, n) {
		var r = [],
			o = [],
			s = [],
			a = [],
			c = this,
			l = 100;

		function d() {
			if ("closed" === e.signalingState) return c.statsGatheringRunning = !1, void n(r, s, o, a);
			e.getStats().then(u).catch(function (e) {
				c.test.reportError("Could not gather stats: " + e), c.statsGatheringRunning = !1, n(r, s)
			}.bind(c)), t && t.getStats().then(h)
		}

		function h(e) {
			if ("chrome" === adapter.browserDetails.browser) {
				var t = enumerateStats(e, c.localTrackIds, c.remoteTrackIds);
				o.push(t), a.push(Date.now())
			}
			else if ("firefox" === adapter.browserDetails.browser)
				for (var i in e) {
					var n = e[i];
					o.push(n), a.push(Date.now())
				}
			else c.test.reportError("Only Firefox and Chrome getStats implementations are supported.")
		}

		function u(e) {
			if ("chrome" === adapter.browserDetails.browser) {
				var t = enumerateStats(e, c.localTrackIds, c.remoteTrackIds);
				r.push(t), s.push(Date.now())
			}
			else if ("firefox" === adapter.browserDetails.browser)
				for (var i in e) {
					var n = e[i];
					r.push(n), s.push(Date.now())
				}
			else c.test.reportError("Only Firefox and Chrome getStats implementations are supported.");
			setTimeout(d, l)
		}
		c.localTrackIds = {
			audio: "",
			video: ""
		}, c.remoteTrackIds = {
			audio: "",
			video: ""
		}, e.getSenders().forEach(function (e) {
			"audio" === e.track.kind ? c.localTrackIds.audio = e.track.id : "video" === e.track.kind && (c.localTrackIds.video = e.track.id)
		}.bind(c)), t && t.getReceivers().forEach(function (e) {
			"audio" === e.track.kind ? c.remoteTrackIds.audio = e.track.id : "video" === e.track.kind && (c.remoteTrackIds.video = e.track.id)
		}.bind(c)), this.statsGatheringRunning = !0, d()
	},
	gotOffer_: function (e) {
		this.constrainOfferToRemoveVideoFec_ && (e.sdp = e.sdp.replace(/(m=video 1 [^\r]+)(116 117)(\r\n)/g, "$1\r\n"), e.sdp = e.sdp.replace(/a=rtpmap:116 red\/90000\r\n/g, ""), e.sdp = e.sdp.replace(/a=rtpmap:117 ulpfec\/90000\r\n/g, ""), e.sdp = e.sdp.replace(/a=rtpmap:98 rtx\/90000\r\n/g, ""), e.sdp = e.sdp.replace(/a=fmtp:98 apt=116\r\n/g, "")), this.pc1.setLocalDescription(e), this.pc2.setRemoteDescription(e), this.pc2.createAnswer().then(this.gotAnswer_.bind(this), this.test.reportFatal.bind(this.test))
	},
	gotAnswer_: function (e) {
		this.constrainVideoBitrateKbps_ && (e.sdp = e.sdp.replace(/a=mid:video\r\n/g, "a=mid:video\r\nb=AS:" + this.constrainVideoBitrateKbps_ + "\r\n")), this.pc2.setLocalDescription(e), this.pc1.setRemoteDescription(e)
	},
	onIceCandidate_: function (e, t) {
		if (t.candidate) {
			var i = Call.parseCandidate(t.candidate.candidate);
			this.iceCandidateFilter_(i) && e.addIceCandidate(t.candidate)
		}
	}
}, Call.noFilter = function () {
	return !0
}, Call.isRelay = function (e) {
	return "relay" === e.type
}, Call.isNotHostCandidate = function (e) {
	return "host" !== e.type
}, Call.isReflexive = function (e) {
	return "srflx" === e.type
}, Call.isHost = function (e) {
	return "host" === e.type
}, Call.isIpv6 = function (e) {
	return -1 !== e.address.indexOf(":")
}, Call.parseCandidate = function (e) {
	var t = "candidate:",
		i = e.indexOf(t) + t.length,
		n = e.substr(i).split(" ");
	return {
		type: n[7],
		protocol: n[2],
		address: n[4]
	}
}, Call.cachedIceServers_ = null, Call.cachedIceConfigFetchTime_ = null, Call.asyncCreateTurnConfig = function (i, e) {
	var t = turnData;

	if ("string" == typeof t.turnURI && "" !== t.turnURI) {
		var n = {
			iceServers: [
				{
					username: t.turnUsername || "",
					credential: t.turnCredential || "",
					urls: t.turnURI.split(",")
				}]
		};
		report.traceEventInstant("turn-config", n), setTimeout(i.bind(null, n), 0)
	}
	else Call.fetchTurnConfig_(function (e) {
		var t = {
			iceServers: e.iceServers
		};
		report.traceEventInstant("turn-config", t), i(t)
	}, e)
}, Call.asyncCreateStunConfig = function (i, e) {
	var t = turnData;
	if ("string" == typeof t.stunURI && "" !== t.stunURI) {
		var n = {
			iceServers: [
				{
					urls: t.stunURI.split(",")
				}]
		};
		report.traceEventInstant("stun-config", n), setTimeout(i.bind(null, n), 0)
	}
	else Call.fetchTurnConfig_(function (e) {
		var t = {
			iceServers: e.iceServers.urls
		};
		report.traceEventInstant("stun-config", t), i(t)
	}, e)
}, Call.fetchTurnConfig_ = function (t, i) {
	if (Call.cachedIceServers_ && !((Date.now() - Call.cachedIceConfigFetchTime_) / 1e3 > parseInt(Call.cachedIceServers_.lifetimeDuration) - 240)) return report.traceEventInstant("fetch-ice-config", "Using cached credentials."), void t(Call.getCachedIceCredentials_());
	var n = new XMLHttpRequest;
	n.onreadystatechange = function () {
		if (4 === n.readyState)
			if (200 === n.status) {
				var e = JSON.parse(n.responseText);
				Call.cachedIceServers_ = e, Call.getCachedIceCredentials_ = function () {
					return JSON.parse(JSON.stringify(Call.cachedIceServers_))
				}, Call.cachedIceConfigFetchTime_ = Date.now(), report.traceEventInstant("fetch-ice-config", "Fetching new credentials."), t(Call.getCachedIceCredentials_())
			}
			else i("TURN request failed")
	}, n.open("POST", "https://networktraversal.googleapis.com/v1alpha/iceconfig?key=" + void 0, !0), n.send()
}, StatisticsAggregate.prototype = {
	add: function (e, t) {
		0 === this.startTime_ && (this.startTime_ = e), this.sum_ += t, this.max_ = Math.max(this.max_, t), this.rampUpTime_ === 1 / 0 && t > this.rampUpThreshold_ && (this.rampUpTime_ = e), this.count_++
	},
	getAverage: function () {
		return 0 === this.count_ ? 0 : Math.round(this.sum_ / this.count_)
	},
	getMax: function () {
		return this.max_
	},
	getRampUpTime: function () {
		return Math.round(this.rampUpTime_ - this.startTime_)
	}
}, Ssim.prototype = {
	statistics: function (e) {
		var t, i = 0;
		for (t = 0; t < e.length; ++t) i += e[t];
		var n = i / (e.length - 1),
			r = 0;
		for (t = 1; t < e.length; ++t) r = e[t - 1] - n, i += e[t] + r * r;
		return {
			mean: n,
			variance: i / e.length
		}
	},
	covariance: function (e, t, i, n) {
		for (var r = 0, o = 0; o < e.length; o += 1) r += (e[o] - i) * (t[o] - n);
		return r / e.length
	},
	calculate: function (e, t) {
		if (e.length !== t.length) return 0;
		var i = 6.502500000000001,
			n = .03 * 255 * (.03 * 255),
			r = n / 2,
			o = this.statistics(e),
			s = o.mean,
			a = o.variance,
			c = Math.sqrt(a),
			l = this.statistics(t),
			d = l.mean,
			h = l.variance,
			u = Math.sqrt(h);
		return (2 * s * d + i) / (s * s + d * d + i) * ((2 * c * u + n) / (a + h + n)) * ((this.covariance(e, t, s, d) + r) / (c * u + r))
	}
}, "object" == typeof exports && (module.exports = Ssim), VideoFrameChecker.prototype = {
	stop: function () {
		this.videoElement_.removeEventListener("play", this.listener_), this.running_ = !1
	},
	getCurrentImageData_: function () {
		this.canvas_.width = this.videoElement_.width, this.canvas_.height = this.videoElement_.height;
		var e = this.canvas_.getContext("2d");
		return e.drawImage(this.videoElement_, 0, 0, this.canvas_.width, this.canvas_.height), e.getImageData(0, 0, this.canvas_.width, this.canvas_.height)
	},
	checkVideoFrame_: function () {
		if (this.running_ && !this.videoElement_.ended) {
			var e = this.getCurrentImageData_();
			this.isBlackFrame_(e.data, e.data.length) && this.frameStats.numBlackFrames++, this.frameComparator.calculate(this.previousFrame_, e.data) > this.identicalFrameSsimThreshold && this.frameStats.numFrozenFrames++, this.previousFrame_ = e.data, this.frameStats.numFrames++, setTimeout(this.checkVideoFrame_.bind(this), 20)
		}
	},
	isBlackFrame_: function (e, t) {
		for (var i = this.nonBlackPixelLumaThreshold, n = 0, r = 4; r < t; r += 4)
			if (i * r / 4 < (n += .21 * e[r] + .72 * e[r + 1] + .07 * e[r + 2])) return !1;
		return !0
	}
}, "object" == typeof exports && (module.exports = VideoFrameChecker);




function TestCaseNames() {
	return this.testCases = {
		AUDIOCAPTURE: "Audio capture",
		CHECKRESOLUTION240: "Check Cam",
		DATATHROUGHPUT: "Data throughput",
		NETWORKLATENCY: "Network latency",
		NETWORKLATENCYRELAY: "Network latency - Relay",
		UDPENABLED: "Udp enabled",
		TCPENABLED: "Tcp enabled",
		VIDEOBANDWIDTH: "Video bandwidth",
		RELAYCONNECTIVITY: "Relay connectivity",
		REFLEXIVECONNECTIVITY: "Reflexive connectivity",
		HOSTCONNECTIVITY: "Host connectivity"
	}, this.testCases
}

var testCaseName = new TestCaseNames;
var testSuiteName = new TestSuiteNames;
var NetworkTest = function (e, t, i, n) {
	this.test = e,
		this.protocol = t,
		this.params = i,
		this.iceCandidateFilter = n
};

addTest(testSuiteName.CAMERA, testCaseName.CHECKRESOLUTION240, function (e) {
	new CamResolutionsTest(e, [[320, 240]]).run()
})

addTest(testSuiteName.MICROPHONE, testCaseName.AUDIOCAPTURE, function (e) {
	new MicTest(e).run()
}),

	addTest(testSuiteName.NETWORK, testCaseName.TCPENABLED, function (e) {
		new NetworkTest(e, "tcp", null, Call.isRelay).run()
	}),

	addTest(testSuiteName.NETWORK, testCaseName.UDPENABLED, function (e) {
		new NetworkTest(e, "udp", null, Call.isRelay).run()
	});


function TestSuiteNames() {
	return this.testSuites = {
		CAMERA: "Camera",
		MICROPHONE: "Microphone",
		NETWORK: "Network",
	}, this.testSuites
}


NetworkTest.prototype = {
	run: function () {
		this.iceCandidateFilter.toString() === Call.isIpv6.toString() ? this.gatherCandidates(null, this.params, this.iceCandidateFilter) : Call.asyncCreateTurnConfig(this.start.bind(this), this.test.reportFatal.bind(this.test))
	},
	start: function (e) {
		this.filterConfig(e, this.protocol), this.gatherCandidates(e, this.params, this.iceCandidateFilter)
	},
	filterConfig: function (e, t) {
		for (var i = "transport=" + t, n = [], r = 0; r < e.iceServers.length; ++r) {
			for (var o = e.iceServers[r], s = [], a = 0; a < o.urls.length; ++a) {
				var c = o.urls[a]; - 1 !== c.indexOf(i) ? s.push(c) : -1 === c.indexOf("?transport=") && c.startsWith("turn") && s.push(c + "?" + i)
			}
			0 !== s.length && (o.urls = s, n.push(o))
		}
		e.iceServers = n
	},
	gatherCandidates: function (e, i, n) {
		var r;
		try {
			r = new RTCPeerConnection(e, i)
		}
		catch (e) {
			return null !== i && i.optional[0].googIPv6 ? this.test.reportWarning("Failed to create peer connection, IPv6 might not be setup/supported on the network.") : this.test.reportError("Failed to create peer connection: " + e), void this.test.done()
		}

		r.addEventListener("icecandidate", function (e) {
			if ("closed" !== e.currentTarget.signalingState)
				if (e.candidate) {
					var t = Call.parseCandidate(e.candidate.candidate);
					n(t) && Network(t.protocol, n(t));
					n(t) && (this.test.reportSuccess("Gathered candidate of Type: " + t.type + " Protocol: " + t.protocol + " Address: " + t.address), r.close(), r = null, this.test.done())
				}
				else {
					r.close(),
						Network(t.protocol, false);
					(r = null) !== i && i.optional[0].googIPv6 ?
						this.test.reportWarning("Failed to gather IPv6 candidates, it might not be setup/supported on the network.") :
						this.test.reportError("Failed to gather specified candidates"),
						this.test.done()
				}
		}.bind(this)), this.createAudioOnlyReceiveOffer(r)
	},

	createAudioOnlyReceiveOffer: function (t) {
		function i() { }
		t.createOffer(
			{
				offerToReceiveAudio: 1
			}).then(function (e) {
				t.setLocalDescription(e).then(i, i)
			}, i)
	}
}

function CamResolutionsTest(e, t) {
	this.test = e,
		this.resolutions = t,
		this.currentResolution = 0,
		this.isMuted = !1,
		this.isShuttingDown = !1
}

CamResolutionsTest.prototype = {
	run: function () {
		this.startGetUserMedia(this.resolutions[this.currentResolution])
	},
	startGetUserMedia: function (t) {
		var e = {
			audio: !1,
			video:
			{
				width:
				{
					exact: t[0]
				},
				height:
				{
					exact: t[1]
				}
			}
		};

		navigator.mediaDevices.getUserMedia(e).then(function (e) {
			1 < this.resolutions.length ? (this.test.reportSuccess("Supported: " + t[0] + "x" + t[1]), e.getTracks().forEach(function (e) {
				e.stop()
			}), this.maybeContinueGetUserMedia()) : this.collectAndAnalyzeStats_(e, t)
		}.bind(this)).catch(function (e) {
			1 < this.resolutions.length ? Cam(false) : Cam(false), this.maybeContinueGetUserMedia()
			1 < this.resolutions.length ? this.test.reportInfo(t[0] + "x" + t[1] + " not supported") : this.test.reportError("getUserMedia failed with error: " + e.name), this.maybeContinueGetUserMedia()
		}.bind(this))
	},
	maybeContinueGetUserMedia: function () {
		this.currentResolution !== this.resolutions.length ? this.startGetUserMedia(this.resolutions[this.currentResolution++]) : this.test.done()
	},
	collectAndAnalyzeStats_: function (e, t) {
		var i = e.getVideoTracks();
		if (i.length < 1) return this.test.reportError("No video track in returned stream."), void this.maybeContinueGetUserMedia();
		var n = i[0];
		"function" == typeof n.addEventListener && (n.addEventListener("ended", function () {
			this.isShuttingDown || this.test.reportError("Video track ended, camera stopped working")
		}.bind(this)), n.addEventListener("mute", function () {
			this.isShuttingDown || (this.test.reportWarning("Your camera reported itself as muted."), this.isMuted = !0)
		}.bind(this)), n.addEventListener("unmute", function () {
			this.isShuttingDown || (this.test.reportInfo("Your camera reported itself as unmuted."), this.isMuted = !1)
		}.bind(this)));
		var r = document.createElement("video");
		r.setAttribute("autoplay", ""), r.setAttribute("muted", ""), r.width = t[0], r.height = t[1], r.srcObject = e;
		var o = new VideoFrameChecker(r),
			s = new Call(null, this.test);
		s.pc1.addStream(e), s.establishConnection(), s.gatherStats(s.pc1, null, e, this.onCallEnded_.bind(this, t, r, e, o), 100), setTimeoutWithProgressBar(this.endCall_.bind(this, s, e), 8e3)
	},
	onCallEnded_: function (e, t, i, n, r, o) {
		this.analyzeStats_(e, t, i, n, r, o), n.stop(), this.test.done()
	},
	analyzeStats_: function (e, t, i, n, r, o) {
		var s = [],
			a = [],
			c = [],
			l = {},
			d = n.frameStats;
		for (var h in r) "ssrc" === r[h].type && 0 < parseInt(r[h].googFrameRateInput) && (s.push(parseInt(r[h].googAvgEncodeMs)), a.push(parseInt(r[h].googFrameRateInput)), c.push(parseInt(r[h].googFrameRateSent)));
		l.cameraName = i.getVideoTracks()[0].label || NaN, l.actualVideoWidth = t.videoWidth, l.actualVideoHeight = t.videoHeight, l.mandatoryWidth = e[0], l.mandatoryHeight = e[1], l.encodeSetupTimeMs = this.extractEncoderSetupTime_(r, o), l.avgEncodeTimeMs = arrayAverage(s), l.minEncodeTimeMs = arrayMin(s), l.maxEncodeTimeMs = arrayMax(s), l.avgInputFps = arrayAverage(a), l.minInputFps = arrayMin(a), l.maxInputFps = arrayMax(a), l.avgSentFps = arrayAverage(c), l.minSentFps = arrayMin(c), l.maxSentFps = arrayMax(c), l.isMuted = this.isMuted, l.testedFrames = d.numFrames, l.blackFrames = d.numBlackFrames, l.frozenFrames = d.numFrozenFrames, report.traceEventInstant("video-stats", l), this.testExpectations_(l)
	},
	endCall_: function (e, t) {
		this.isShuttingDown = !0, t.getTracks().forEach(function (e) {
			e.stop()
		}), e.close()
	},
	extractEncoderSetupTime_: function (e, t) {
		for (var i = 0; i !== e.length; i++)
			if ("ssrc" === e[i].type && 0 < parseInt(e[i].googFrameRateInput)) return JSON.stringify(t[i] - t[0]);
		return NaN
	},
	resolutionMatchesIndependentOfRotationOrCrop_: function (e, t, i, n) {
		var r = Math.min(i, n);
		return e === i && t === n || e === n && t === i || e === r && n === r
	},
	testExpectations_: function (e) {
		var t = [];
		for (var i in e) e.hasOwnProperty(i) && ("number" == typeof e[i] && isNaN(e[i]) ? t.push(i) : this.test.reportInfo(i + ": " + e[i]));
		0 !== t.length && this.test.reportInfo("Not available: " + t.join(", ")), isNaN(e.avgSentFps) ?
			this.test.reportInfo("Cannot verify sent FPS.") :

			e.avgSentFps < 5 ? Cam(false) :
				Cam(true), this.resolutionMatchesIndependentOfRotationOrCrop_(e.actualVideoWidth, e.actualVideoHeight, e.mandatoryWidth, e.mandatoryHeight) ?
				Cam(true) :
				Cam(false), 0 === e.testedFrames ?
				Cam(false) : (e.blackFrames > e.testedFrames / 3 &&
					Cam(false), e.frozenFrames > e.testedFrames / 3 &&
					Cam(false))

		0 !== t.length && this.test.reportInfo("Not available: " + t.join(", ")), isNaN(e.avgSentFps) ? this.test.reportInfo("Cannot verify sent FPS.") : e.avgSentFps < 5 ? this.test.reportError("Low average sent FPS: " + e.avgSentFps) : this.test.reportSuccess("Average FPS above threshold"), this.resolutionMatchesIndependentOfRotationOrCrop_(e.actualVideoWidth, e.actualVideoHeight, e.mandatoryWidth, e.mandatoryHeight) ? this.test.reportSuccess("Captured video using expected resolution.") : this.test.reportError("Incorrect captured resolution."), 0 === e.testedFrames ? this.test.reportError("Could not analyze any video frame.") : (e.blackFrames > e.testedFrames / 3 && this.test.reportError("Camera delivering lots of black frames."), e.frozenFrames > e.testedFrames / 3 && this.test.reportError("Camera delivering lots of frozen frames."))
	}
}

function MicTest(e) {
	this.test = e, this.inputChannelCount = 6, this.outputChannelCount = 2, this.bufferSize = 0, this.constraints = {
		audio:
		{
			optional: [
				{
					echoCancellation: !1
				}]
		}
	}, this.collectSeconds = 2, this.silentThreshold = 1 / 32767, this.lowVolumeThreshold = -60, this.monoDetectThreshold = 1 / 65536, this.clipCountThreshold = 6, this.clipThreshold = 1, this.collectedAudio = [];
	for (var t = this.collectedSampleCount = 0; t < this.inputChannelCount; ++t) this.collectedAudio[t] = [];
	var i = window.AudioContext || window.webkitAudioContext;
	this.audioContext = new i
}

MicTest.prototype = {
	run: function () {
		this.audioContext.resume().then(function () {
			doGetUserMedia(this.constraints, this.gotStream.bind(this))
		}.bind(this)).catch(function (e) {
			this.test.reportError("WebAudio run failure: " + e), this.test.done()
		}.bind(this))
	},
	gotStream: function (e) {
		this.checkAudioTracks(e) ? this.createAudioBuffer(e) : this.test.done()
	},
	checkAudioTracks: function (e) {
		var t = (this.stream = e).getAudioTracks();
		t.length < 1 ? Mic(false) : Mic(true);

		return t.length < 1 ? (this.test.reportError("No audio track in returned stream."), !1) : (this.test.reportSuccess("Audio track created using device=" + t[0].label), !0)
	},
	createAudioBuffer: function () {
		this.audioSource = this.audioContext.createMediaStreamSource(this.stream), this.scriptNode = this.audioContext.createScriptProcessor(this.bufferSize, this.inputChannelCount, this.outputChannelCount), this.audioSource.connect(this.scriptNode), this.scriptNode.connect(this.audioContext.destination), this.scriptNode.onaudioprocess = this.collectAudio.bind(this), this.stopCollectingAudio = setTimeoutWithProgressBar(this.onStopCollectingAudio.bind(this), 5e3)
	},
	collectAudio: function (e) {
		for (var t = e.inputBuffer.length, i = !0, n = 0; n < e.inputBuffer.numberOfChannels; n++) {
			var r, o = e.inputBuffer.getChannelData(n),
				s = Math.abs(o[0]),
				a = Math.abs(o[t - 1]);
			s > this.silentThreshold || a > this.silentThreshold ? ((r = new Float32Array(t)).set(o), i = !1) : r = new Float32Array, this.collectedAudio[n].push(r)
		}
		i || (this.collectedSampleCount += t, this.collectedSampleCount / e.inputBuffer.sampleRate >= this.collectSeconds && this.stopCollectingAudio())
	},
	onStopCollectingAudio: function () {
		this.stream.getAudioTracks()[0].stop(), this.audioSource.disconnect(this.scriptNode), this.scriptNode.disconnect(this.audioContext.destination), this.analyzeAudio(this.collectedAudio), this.test.done()
	},
	analyzeAudio: function (e) {
		for (var t = [], i = 0; i < e.length; i++) this.channelStats(i, e[i]) && t.push(i);

		0 === t.length ? this.test.reportError("No active input channels detected. Microphone is most likely muted or broken, please check if muted in the sound settings or physically on the device. Then rerun the test.") : this.test.reportSuccess("Active audio input channels: " + t.length), 2 === t.length && this.detectMono(e[t[0]], e[t[1]])
	},
	channelStats: function (e, t) {
		for (var i = 0, n = 0, r = 0, o = 0, s = 0; s < t.length; s++) {
			var a = t[s];
			if (0 < a.length) {
				for (var c = 0, l = 0, d = 0; d < a.length; d++) l += (c = Math.abs(a[d])) * c, (i = Math.max(i, c)) >= this.clipThreshold ? (r++, o = Math.max(o, r)) : r = 0;
				l = Math.sqrt(l / a.length), n = Math.max(n, l)
			}
		}
		if (i > this.silentThreshold) {
			var h = this.dBFS(i),
				u = this.dBFS(n);
			return this.test.reportInfo("Channel " + e + " levels: " + h.toFixed(1) + " dB (peak), " + u.toFixed(1) + " dB (RMS)"), u < this.lowVolumeThreshold && this.test.reportError("Microphone input level is low, increase input volume or move closer to the microphone."), o > this.clipCountThreshold && this.test.reportWarning("Clipping detected! Microphone input level is high. Decrease input volume or move away from the microphone."), !0
		}
		return !1
	},
	detectMono: function (e, t) {
		for (var i = 0, n = 0; n < e.length; n++) {
			var r = e[n],
				o = t[n];
			if (r.length === o.length)
				for (var s = 0; s < r.length; s++) Math.abs(r[s] - o[s]) > this.monoDetectThreshold && i++;
			else i++
		}
		0 < i ? this.test.reportInfo("Stereo microphone detected.") : this.test.reportInfo("Mono microphone detected.")
	},
	dBFS: function (e) {
		var t = 20 * Math.log(e) / Math.log(10);
		return Math.round(10 * t) / 10
	}
}

function Mic(is) {
	if (is) {
		// console.debug("Mic On");
		document.getElementById("device-mic").style.backgroundColor = "#90ec90";
	}
	else {
		document.getElementById("device-mic").style.backgroundColor = "#ff5959";
		// console.debug("Mic Off")
	}
}

function Network(type, is) {
	if (type == "udp") {
		if (is) {
			document.getElementById("device-network").style.backgroundColor = "#90ec90";
			// console.debug("Network On");
		}
		else {
			document.getElementById("device-network").style.backgroundColor = "#ff5959";
			// console.debug("Network Off")
		}
	}
	else {
		if (is) {
			document.getElementById("device-network").style.backgroundColor = "#90ec90";
			// console.debug("Network On");
		}
		else {
			document.getElementById("device-network").style.backgroundColor = "#ff5959";
			// console.debug("Network Off")
		}
	}
}

function Cam(is) {
	if (is) {
		document.getElementById("device-cam").style.backgroundColor = "#90ec90";
		// console.debug("Cam On");
	}
	else {
		document.getElementById("device-cam").style.backgroundColor = "#ff5959";
		// console.debug("Cam Off")
	}
}

function Refresh(start) {
	let btn = document.getElementById("refresh");

	if (start) {
		document.getElementById("device-network").style.backgroundColor = "#ffffff";
		document.getElementById("device-cam").style.backgroundColor = "#ffffff";
		document.getElementById("device-mic").style.backgroundColor = "#ffffff";
		btn.setAttribute("disabled", '');
		btn.style.cursor = "default";
	}
	else {
		btn.removeAttribute("disabled");
		btn.innerHTML = window.langlist.REFRESH;
		btn.style.cursor = "pointer";
	}
}


document.getElementById("refresh").addEventListener("click", function () {
	if (!this.hasAttribute("disabled"))
		document.getElementById("startButton").click();
})