var WFPopups=WFExtensions.add('Popups',{popups:{},popup:'',config:{},addPopup:function(n,o){this.popups[n]=o;WFExtensions.addExtension('popups',n,o)},getPopups:function(){return this.popups},setup:function(){var self=this,ed=tinyMCEPopup.editor,s=ed.selection;if(!s.isCollapsed()){n=s.getNode();var state=true,v;function setText(state,v){if(state&&v){$('#popup_text').val(v);$('#popup_text').attr('disabled',false)}else{$('#popup_text').val(tinyMCEPopup.getLang('dlg.element_selection','Element Selection'));$('#popup_text').attr('disabled',true);$('#popup_text').addClass('disabled')}}v=s.getContent({format:'text'});if(n){var children=tinymce.grep(n.childNodes,function(node){return ed.dom.is(node,'br[data-mce-bogus]')==false});state=children.length==1&&children[0].nodeType==3}setText(state,v)}$.each(this.popups,function(k,v){self._call('setup','',v)})},isPopup:function(n,v){return n&&n.nodeName=='A'&&this._call('check',n,v)},getPopup:function(n){var self=this,ed=tinyMCEPopup.editor,popup,popups=this.getPopups();if(n.nodeName!='A'){n=ed.dom.getParent(n,'a')}$.each(this.popups,function(k,v){if(self.isPopup(n,k)){self.popup=k}});if(this.popup){this.selectPopup(this.popup);return this.getAttributes(n)}return''},setPopup:function(s){this.popup=s},setConfig:function(config){$.extend(this.config,config)},setParams:function(n,p){var popup=this.popups[n];if(popup){if(typeof popup.params=='undefined'){popup.params={}}$.extend(popup.params,p)}},getParams:function(n){return this.popups[n].params||{}},getParam:function(n,p){var params=this.getParams(n);return params[p]||null},selectPopup:function(v){var self=this;$('option','#popup_list').each(function(){if(this.value){$('#popup_extension_'+this.value).hide();if(v==this.value||$(this).is(':selected')){this.selected=true;$('#popup_extension_'+this.value).show();self.popup=this.value;self._call('onSelect',[],this.value)}}})},setAttributes:function(n,args){var ed=tinyMCEPopup.editor;if(this.config['map']){$.each(this.config['map'],function(to,from){var v=args[from]||$('#'+from).val();ed.dom.setAttrib(n,to,v);delete args[from]})}return this._call('setAttributes',[n,args])},getAttributes:function(n){var ed=tinyMCEPopup.editor,k,v,at,data;if(n.nodeName!='A'){n=ed.dom.getParent(n,'a')}if(this.isPopup(n)){data=this._call('getAttributes',n)}return data},isEnabled:function(){return this.popup},createPopup:function(n,args){var self=this,ed=tinyMCEPopup.editor,o,el;args=args||{};if(this.isEnabled()){if(n&&(n.nodeName=='A'||(n=ed.dom.getParent(n,'A')))){this.removePopups(n);this.setAttributes(n,args)}else{if(ed.selection.isCollapsed()){ed.execCommand('mceInsertContent',false,'<a href="javascript:mctmp(0);">'+$('#popup_text').val()+'</a>',{skip_undo:1})}else{ed.execCommand('mceInsertLink',false,'javascript:mctmp(0);')}tinymce.each(ed.dom.select('a[href=javascript:mctmp(0);]'),function(link){self.setAttributes(link,args);el=link});var se=ed.selection,marker;if(tinymce.isIE){marker=ed.dom.create('span',{'data-mce-type':'bookmark'},'\u00a0');ed.dom.insertAfter(marker,el);se.select(marker);se.collapse()}else{if(el.parentNode.nodeName=='BODY'){marker=ed.dom.create('span',{'data-mce-bogus':1},' ');ed.dom.insertAfter(marker,el);se.select(marker);se.collapse(1)}else{se.select(el);se.collapse()}}}}else{if(this.isPopup(n)){ed.dom.remove(n,true)}}},removePopups:function(n){var self=this;$.each(this.popups,function(k,v){self._call('remove',n,v)})},onSelectFile:function(args){this._call('onSelectFile',args)},_call:function(fn,args,popup){if(!popup){popup=this.popup}if(typeof popup=='string'){popup=this.popups[popup]||{}}fn=popup[fn];if(fn){if(typeof args=='object'&&args instanceof Array){return fn.apply(popup,args)}else{return fn.call(popup,args)}}return false}});