(window.webpackJsonp=window.webpackJsonp||[]).push([[5],{jORc:function(n,t,e){"use strict";e.r(t);var o=e("ofXK"),c=e("tyNb"),r=e("3Pt+"),i=e("wbwO");function a(n){return n.value&&!Object(i.b)(n.value)?{invalidMnemonic:!0}:null}var m=e("fXoL"),b=e("flj8"),u=e("kmnG"),s=e("qFsG"),l=e("ihCf"),d=e("bTqV");function f(n,t){1&n&&(m.Rb(0,"mat-error"),m.uc(1," We need valid mnemonic to proceed "),m.Qb())}const p=[{path:"",component:(()=>{class n{constructor(n,t){this.router=n,this.accountService=t,this.mnemonicForm=new r.f({mnemonic:new r.d("",[r.q.required,a])})}get mnemonic(){return this.mnemonicForm.controls.mnemonic}next(){this.accountService.setMnemonic(this.mnemonic.value),this.router.navigate(["/main"])}generateNew(){const n=Object(i.a)();this.mnemonicForm.controls.mnemonic.setValue(n)}}return n.\u0275fac=function(t){return new(t||n)(m.Mb(c.a),m.Mb(b.a))},n.\u0275cmp=m.Gb({type:n,selectors:[["app-account-setup"]],decls:20,vars:3,consts:[[1,"fixed-horizontal-center","start-container"],["fxLayout","column","fxLayoutAlign","space-around stretch"],[3,"formGroup"],["href","https://z.cash/technology/jubjub/"],["appearance","outline",1,"field"],["formControlName","mnemonic","matInput","","placeholder","12, 15, 18, 21 or 24 words...","cdkTextareaAutosize","","cdkAutosizeMinRows","8"],[4,"ngIf"],[1,"actions","button-box"],["mat-flat-button","","color","primary",3,"click"],["mat-flat-button","","color","accent","routerLink","/main",1,"next-btn",3,"disabled","click"]],template:function(n,t){1&n&&(m.Rb(0,"div",0),m.Rb(1,"div",1),m.Rb(2,"form",2),m.Rb(3,"h1"),m.uc(4,"Enter mnemonic"),m.Qb(),m.Rb(5,"h3"),m.uc(6," To make your transaction private we need a KeyPair on "),m.Rb(7,"a",3),m.uc(8,"BabyJubJub"),m.Qb(),m.uc(9," elliptic curve, please provide some mnemonic for us "),m.Qb(),m.Rb(10,"mat-form-field",4),m.Rb(11,"mat-label"),m.uc(12,"Place mnemonic here"),m.Qb(),m.Nb(13,"textarea",5),m.tc(14,f,2,0,"mat-error",6),m.Qb(),m.Rb(15,"div",7),m.Rb(16,"button",8),m.Zb("click",(function(n){return t.generateNew()})),m.uc(17," Generate new mnemonic "),m.Qb(),m.Rb(18,"button",9),m.Zb("click",(function(n){return t.next()})),m.uc(19,"Next "),m.Qb(),m.Qb(),m.Qb(),m.Qb(),m.Qb()),2&n&&(m.Bb(2),m.ic("formGroup",t.mnemonicForm),m.Bb(12),m.ic("ngIf",t.mnemonic.hasError("invalidMnemonic")),m.Bb(4),m.ic("disabled",t.mnemonicForm.invalid))},directives:[r.r,r.m,r.g,u.b,u.f,r.b,s.a,l.b,r.l,r.e,o.k,d.a,c.b,u.a],styles:["@media(min-width:600px){.fixed-horizontal-center[_ngcontent-%COMP%]{left:50%;position:fixed;transform:translateX(-50%);-webkit-transform:translateX(-50%);-moz-transform:translateX(-50%);-ms-transform:translateX(-50%);-o-transform:translateX(-50%);width:auto}}@media(max-width:600px){.fixed-horizontal-center[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%], .fixed-horizontal-center[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%]{text-align:center}}.button-box[_ngcontent-%COMP%]{display:flex;justify-content:space-between;margin-top:5px;width:100%}.button-box[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]{width:auto}@media(min-width:600px){.button-box[_ngcontent-%COMP%]{flex-direction:row}}@media(max-width:600px){.button-box[_ngcontent-%COMP%]{flex-direction:column}.button-box[_ngcontent-%COMP%]   .next-btn[_ngcontent-%COMP%]{margin-top:2em}}"]}),n})()}];let h=(()=>{class n{}return n.\u0275mod=m.Kb({type:n}),n.\u0275inj=m.Jb({factory:function(t){return new(t||n)},imports:[[c.c.forChild(p)],c.c]}),n})();e.d(t,"AccountSetupModule",(function(){return x}));let x=(()=>{class n{}return n.\u0275mod=m.Kb({type:n}),n.\u0275inj=m.Jb({factory:function(t){return new(t||n)},imports:[[o.c,u.d,s.b,d.b,l.c,h,r.p]]}),n})()}}]);