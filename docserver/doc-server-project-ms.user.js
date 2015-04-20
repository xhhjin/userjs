﻿// ==UserScript==
// @name        ArcSoft Project Management
// @version     6
// @author      maxint <NOT_SPAM_lnychina@gmail.com>, xhhjin
// @namespace   http://maxint.github.io
// @description An enhancement for Arcsoft project management system in http://doc-server
// @include     http://doc-server/*
// @include     https://doc-server/*
// @updateURL   https://github.com/xhhjin/userjs/raw/master/docserver/doc-server-project-ms.user.js
// @downloadURL https://github.com/xhhjin/userjs/raw/master/docserver/doc-server-project-ms.user.js
// @grant       none
// @Note
// v6
//  -Fix bug of Object.keys() in Chrome.
//
// v5
//  - Fix bug of no response in Firefox.
//  - Sort project Ids.
//
// v4
//  - Fix bug of wrong id in Chrome.
//
// v3
//  - Update id checkboxes w.r.t. keyboard input.
//  - Sort project id rows w.r.t. checked statuses.
//  - Add input project id automatically.
//
// v2
//  - Fix bug of pause when multiple delivery packages.
//  - Add checkboxes to project id table.
//
// v1
//  - Add support for delivery multiple packages to multiple projects at one time.
//
// v0.0.9
//  - Add https support.
//  - Add "Release" column to "/index2014/Engineering/index.asp" page.
//
// v0.0.8
//  - Add partial auto fill support for "Edit" window.
//  - Add message alert when flushing project IDs.
//  - Fix bug of "Invert Rows" caused by web page update.
//
// v0.0.7
//  - Update @updateURL and @downloadURL.
//  - Add support for "Edit" in "Add Release Page".
//
// v0.0.6
//  - Fix bug of date format.
//
// v0.0.5
//  - Login page: login when press <Enter> in password input.
//
// v0.0.4
//  - Add management of "Related Projects".
//
// v0.0.3
//  - Add "Invert Rows" button to "Release List" page.
//
// v0.0.2
//  - Auto save data in "Add Rlease" form.
//
// v0.0.1
//  - 首页 | “项目” 导航到 “项目跟踪”
//  - “项目跟踪”页面添加 "Release"
//  - "Add Release Package" 窗口：
//      * 自动填写日期
//      * 根据Release Package填写Version
//      * 自动查询Related Project名称
//
// ==/UserScript==

// a function that loads jQuery and calls a callback function when jQuery has finished loading
; (function (callback, safe) {
    if (typeof(jQuery) == "undefined") {
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = "https://ajax.aspnetcdn.com/ajax/jQuery/jquery-1.11.1.min.js";
        if (safe) {
            var cb = document.createElement("script");
            cb.type = "text/javascript";
            cb.textContent = "jQuery.noConflict();(" + callback.toString() + ")(jQuery, window);";
            script.addEventListener('load', function () {
                document.head.appendChild(cb);
            });
        } else {
            var dollar = undefined;
            if (typeof($) != "undefined") dollar = $;
            script.addEventListener('load', function () {
                jQuery.noConflict();
                $ = dollar;
                callback(jQuery, window);
            });
        }
        document.head.appendChild(script);
    } else {
        console.log('Using jquery ' + jQuery().jquery);
        setTimeout(function () {
            //Firefox supports
            console.log('Runing custom script');
            callback(jQuery, typeof(unsafeWindow) == "undefined" ? window : unsafeWindow);
        }, 30);
    }
})(function ($, window) {
    // helper functions
    // local storage
    var IStorage = function (prefix) {
        var pref = prefix + '.';
        var addpref = function (key) { return pref + key; };
        this.get = function (key, def) {
            var val = window.localStorage.getItem(addpref(key));
            return val || def || null;
        };
        this.set = function (key, val) {
            window.localStorage.setItem(addpref(key), val);
        };
        this.flush = function () {
            window.localStorage.clear();
        };
        this.getObject = function (key, def) {
            var val = this.get(key);
            return val ? JSON.parse(val) : (def || null);
        };
        this.setObject = function (key, val) {
            this.set(key, JSON.stringify(val));
        };
    };

    // assert function
    function assert(condition, message) {
        if (!condition) {
            throw message || "Assertion failed";
        }
    }

    // replace main menu [Project]
    function redirectToProjectListPage(obj) {
        obj.attr('href', '/projectManage/ProjectList.asp');
    }
    redirectToProjectListPage($('li#mainMenuItem_150000 a'));

    // add "Release" column in second row of table
    function addReleaseToTable(table) {
        var trs = table.find('tbody tr');
        trs.first().find('th:nth-child(2)').after('<th>Operations</th>');
        trs.nextAll().each(function () {
            var id = $(this).find('td:first a:first').text();
            var rlsUrl = 'http://doc-server/projectManage/ProjectOther/ReleaseList.asp?proj_id=' + id
            var link = '<a href="' + rlsUrl + '">Release</a>'
            $(this).find('td:nth-child(2)').after('<td>' + link + '</td>');
        });
    }

    // fill input values
    function fillValues(dict, istore) {
        for (var key in dict) {
            var elem = dict[key];
            if (!elem.val())
                elem.val(istore.get(key, ''));
        }
    }
    // save input values
    function storeValues(dict, istore) {
        for (var key in dict) {
            istore.set(key, dict[key].val());
        }
    }

    // check id
    function checkID(id) {
        return /^\d{4,5}$/.test(id);
    }

    // operate w.r.t. sub path
    var subpath = window.location.pathname;
    if (subpath == '/login.asp') {
        $('input#password').keyup(function (e) {
            if (e.which == 13) {
                $('input[value="Login"]').click();
            }
        });
    } else if (subpath == '/index2014/index.asp') {
        console.log('Index2014');
        redirectToProjectListPage($('div#headerTopDiv div a:nth-child(2)'));
    } else if (subpath == '/projectManage/ProjectList.asp') {
        console.log('ProjectList');
        addReleaseToTable($('table.ListTable'));
    } else if (subpath == '/index2014/Engineering/index.asp') {
        console.log('Engineering');
        addReleaseToTable($('#workspace table:first'));
    } else if (subpath == '/projectManage/ProjectOther/ReleaseList.asp') {
        console.log('ReleaseList');
        if (window.location.protocol == 'https:') {
            console.log('Redirecting to http ...');
            window.location.replace(window.location.href.replace('https://', 'http://'));
            return;
        }
        // invert table row
        $('<input type="button" value="Invert Rows"/>').insertBefore($("input[type='button']")).click(function () {
            $('table.ListTable tbody').each(function (elem, index) {
                var arr = $.makeArray($("tr", this).detach());
                var th = arr.shift();
                arr.reverse();
                arr.unshift(th);
                $(this).append(arr);
            });
        }).click();
    } else if (subpath == '/projectManage/ProjectDelivery/delivery_codingreport_update.asp') {
        console.log('delivery');
        var id = $('#projectid').val();
        var istore = new IStorage('project/' + id);
        var dict = {
            'svn_path': $('input#SourceCodePath'),
            'last_tag': $('input#SOSLabel'),
            'hzpm_notes': $('textarea#hzpm_notes'),
        };
        fillValues(dict, istore);
        $(window).unload(function () {
            console.log('window unload');
            storeValues(dict, istore);
        });
    } else if (subpath == '/projectManage/ProjectOther/addRelease.asp') {
        console.log('addRelease');
        var istore = new IStorage('addRelease');
        // related project IDs
        var IDManager = function (db) {
            var storeid = 'IDs';
            var idb = db;
            var cb = function () {};
            this.data = {};
            this.load = function () {
                this.data = idb.getObject(storeid, {});
                cb(this.data);
                return this;
            };
            this.save = function () {
                idb.setObject(storeid, this.data);
                return this;
            };
            this.contains = function (id) {
                return id in this.data;
            };
            this.add = function (id, name) {
                assert(checkID(id));
                if (!this.contains(id)) {
                    this.data[id] = {name: name};
                    cb(this.data);
                }
                return this;
            };
            this.set = function (id, name) {
                if (this.contains(id)) {
                    this.data[id] = {name: name};
                }
                return this;
            };
            this.remove = function (id) {
                if (this.contains(id)) {
                    delete this.data[id];
                    cb(this.data);
                }
                return this;
            };
            this.clear = function (id) {
                if (this.data) {
                    this.data = {};
                    cb(this.data);
                }
                return this;
            };
            this.change = function (callback) {
                var oldcb = cb;
                cb = function (data) { oldcb(data); callback(data); }
                return this;
            };
            this.check = function (id, callback) {
                if (checkID(id)) {
                    var url = '../ProjectDelivery/delivery_releated_project_list.asp';
                    $.get(url, {projid: id}, function (data, status) {
                        name = $(data).find('td:nth-child(2)').text();
                        if (status == 'success' && name != "" && callback) {
                            proj_status = $(data).find('td:nth-child(3)').text();
                            callback(id, name, proj_status);
                        } else {
                            callback(id);
                        }
                    });
                } else {
                    callback();
                }
                return this;
            };
        };
        var idmgr = new IDManager(istore);
        if (window.location.search.indexOf('IdentityID=') == -1) {
            // date
            var d = new Date();
            $('input#txtDate').val(d.getFullYear() + '/' + (d.getMonth()+1) + '/' + d.getDate());
            // create packages textarea
            var packagesTextArea = $('<textarea id="txtDeliveryPackages"></textarea>').css({
                'width': '100%',
                'height': '80px',
            });
            $('input#txtDeliveryPackage').hide().siblings('input').hide().last().after(packagesTextArea);
            packagesTextArea.next().each(function () {
                $(this).html('请输入递交包文件名，支持多个文件一起提交，每行一个文件名。');
            });
            // fill previous data
            var dict = {
                'version': $("input[name='txtVersion']"),
                'releasepath': $('input#txtReleasePath'),
                'package': $('input#txtDeliveryPackage'),
                'packages': $('textarea#txtDeliveryPackages'),
                'relatedProjectID': $("input[name='txtReleaseReleatedProject']"),
                'note': $('textarea#txtNotes'),
            };
            fillValues(dict, istore);
            // save result before close window
            $(window).unload(function () {
                console.log('window closing');
                storeValues(dict, istore);
                idmgr.save();
            });
            // submit
            $('#btnSubmit').removeAttr('onclick').click(function () {
                // check form
                console.log('checking form ...');
                if (!checkReleateProject())
                    return;
                var pkgs = packagesTextArea.val().split('\n');
                for (var i in pkgs) {
                    var pkg = pkgs[i];
                    $('input#txtReleasePath,input#txtDeliveryPackage').val(pkg);
                    if (!$('#form1').valid()) {
                        alert('提交包列表格式不对');
                        return;
                    }
                }
                // submit
                $(this).attr('disabled', true);
                for (var i in pkgs) {
                    var pkg = pkgs[i];
                    console.log('submitting ' + pkg + ' ...');
                    $('input#txtReleasePath,input#txtDeliveryPackage').val(pkg);
                    var qstr = $('#form1').formSerialize();
                    $.post('/projectManage/Ajax/AjaxSubmitProjectRelease.asp', qstr, function (data) {
                        if (data != "success")
                            alert(data);
                    });
                }
                alert("提交成功");
                parent.document.location.reload();
            });
        }
        // update version
        $('#txtDeliveryPackage,#txtDeliveryPackages').change(function () {
            var val = $(this).val();
            var vers = /(\d+)\.(\d+)\.(\d+)\.(\d+)/g.exec(val);
            if (vers == null)
                vers = /(\d+)\.(\d+)\.(\d+)/g.exec(val);
            if (vers) {
                vstr = [vers[1], vers[2], vers[3], vers[4]].join('.')
                $("input[name='txtVersion']").val(vstr);
            }
        }).css({
            'width': '100%',
        });
        // release package
        $('input#txtReleasePath').css({
            'width': '100%',
        });
        // related project table
        $(function () {
            var table = $('<table>' +
                          '<thead><tr style="width:10px">' +
                              '<td><input id="selectAllIDs" type="checkbox"></td><td style="width:40px">ID</td><td>Name</td><td style="width:60px">Operation</td>' +
                          '</tr></thead>' +
                          '<tbody></tbody>' +
                          '<tfoot>' +
                              '<tr><td/>' +
                              '<td><input id="inputID" type="text" maxlength="4" size="4"/></td>' +
                              '<td id="inputIDtxt" class="projIdName">Clicking "Add" to add item</td>' +
                              '<td><input id="addID" type="button" value="Add" disabled="true"/></td></tr>' +
                              '<tr><td/><td/><td>Clear all saved data</td>' +
                              '<td><input id="flushIDs" type="button" value="Flush"/></td></tr>' +
                          '</tfoot>' +
                          '</table>').css({ width: '100%' });
            $('input#btnCheckReleatedProject').after('<div></div>').next().after(table);
            // update check states of check boxes
            var updateCheckBoxes = function() {
                var checked = table.find('tbody input:checked').length;
                var total = table.find('tbody input:checkbox').length;
                table.find('input#selectAllIDs').each(function () {
                    this.indeterminate = checked != total && checked != 0;
                    if (!this.indeterminate)
                        this.checked == checked == total;
                });
            };
            // detete id input box
            $("input[name='txtReleaseReleatedProject']").keyup(function () {
                var val = this.value.trim();
                var selected = val.split(',');
                if (val == '' || selected.every(checkID)) {
                    console.log('Selected: ' + selected);
                    $(':checkbox', table).attr('checked', false);
                    for (var i in selected) {
                        var id = selected[i];
                        if (!idmgr.contains(id)) {
                            idmgr.check(id, function (id, name) {
                                if (name) {
                                    idmgr.add(id, name);
                                }
                            });
                        }
                        $('#proj_' + id + ' :checkbox', table).attr('checked', true);
                    }
                    // move checked IDs to the front
                    $('tbody input:checked', table).parent().parent().detach().prependTo($('tbody', table));
                }
                updateCheckBoxes();
            });
            idmgr.change(function (data) {
                table.find('tbody').each(function () {
                    $(this).empty();
                    // insert items
                    var keys = Object.keys(data).filter(checkID);
                    keys.sort();
                    for (var i in keys) {
                        var id = keys[i];
                        var val = data[id];
                        $('<tr id=proj_' + id + '>' +
                          '<td><input type="checkbox"></td>' +
                          '<td>' + id + '</td>' +
                          '<td class="projIdName">' + val['name'] + '</td>' +
                          '<td><input id="delID" type="button" value="Del"/></td></tr>').appendTo($(this));
                    }
                    $("input[name='txtReleaseReleatedProject']").keyup();
                });
            }).load();
            table.find('tbody').delegate('input#delID', 'click', function () {
                var id = $(this).parent().prev().prev().text();
                console.log('Delete: ' + id);
                $('#proj_' + id + ' :checkbox', table).attr('checked', false).click();
                idmgr.remove(id);
            });
            table.delegate(':checkbox', 'click', function() {
                var ids = [];
                table.find('tbody input:checked').parent().next().each(function() {
                    ids.push($(this).text());
                });
                $("input[name='txtReleaseReleatedProject']").val(ids.join(','));
                updateCheckBoxes();
            }).delegate('td.projIdName', 'click', function () {
                if ($(this).find('input').length) return;
                var oldval = $(this).text();
                $(this).addClass('cellEditing');
                $(this).empty();
                var input = $('<input type="text"/>').val(oldval);
                input.appendTo($(this)).focus().keypress(function (e) {
                    if (e.which == 13) {
                        // enter
                        var id = $(this).parent().prev().text();
                        var newval = $(this).val();
                        $(this).parent().text(newval);
                        idmgr.set(id, newval);
                    }
                }).blur(function () {
                    $(this).parent().text(oldval);
                }).css({
                    width: '100%',
                });
            }).find('input#selectAllIDs').click(function () {
                table.find(':checkbox').attr('checked', this.checked);
            })
            var addButton = $('input#addID', table)
            table.find('tfoot').delegate('input#inputID', 'keyup', function (e) {
                if (e.which == 13 && !addButton.attr('disabled')) {
                    addButton.click();
                    return;
                }
                idmgr.check(this.value, function (name) {
                    table.find('td#inputIDtxt').html(name || '<font color="#FF0000">[Invalid project id]</font>');
                    addButton.attr('disabled', name == undefined)
                });
            }).delegate('input#addID', 'click', function () {
                var id = table.find('input#inputID').val();
                var name = table.find('td#inputIDtxt').text();
                console.log('Add: ' + id +', ' + name);
                idmgr.add(id, name);
            }).delegate('input#flushIDs', 'click', function () {
                if (confirm('Delete all project IDs?')) {
                    idmgr.clear();
                }
            });
        });
        // notes
        $('textarea#txtNotes').css({
            width: '100%',
            height: '80px',
        });
    }
}, true);
