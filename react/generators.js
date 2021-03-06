'use strict';

import Generator from "./generator.js";

const e = React.createElement;

class Generators extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            generators: retrieveObject("generators")
        };
    }

    componentDidMount() {
        window.newGenerator = this.newGenerator.bind(this);
        window.newPassGenerator = this.newPassGenerator.bind(this);
        window.removeChild = this.removeChild.bind(this);
    }

    // for new event generator
    newGenerator(nty) {

        if (nty != undefined)
            $('#modal').modal("hide");

        var name = $("#event-name")[0].value.trim();
        var password = $("#event-password")[0].value.trim();
        var max = $("#no-of-tickets")[0].value.trim();
        var date = $("#date")[0].value.trim();
        var time = $("#time")[0].value.trim();
        var url = $("#url")[0].value.trim();
        var x = $("#x-coord")[0].value.trim();
        var y = $("#y-coord")[0].value.trim();

        //do validation here

        if (name == "" || password == "" || max == "" || date == "" || time == "") {

            $(".modal-body").html("Looks like you haven't provided all the required information");
            $("#modal").modal("show");
            return;
        }

        if (isNaN(max)) {
            $(".modal-body").html("We can't create '" + max + "' number of Cryptickets, silly!");
            $("#modal").modal("show");
            return;
        }

        if ($("#optional-ticket-generator").hasClass("xup")) {
            //optional is off
            url = x = y = "";
        } else {

            if ((x != "" && y == "") || (x == "" && y != "")) {

                $(".modal-body").html("Looks like you've only given partial coordinates");
                $("#modal").modal("show");
                return;
            }
        }

        if (password.length < 64 && nty == undefined) {

            $(".modal-body").html("It's recommended, although not required, to use a very long and unique secret with special and alphanumeric characters.\
              You can regenerate the same Cryptickets by using the same secret. \
             If you're going to use this Generator to create Cryptickets for commercial purposes,\
               you should use extremely long secrets (thousands of characters long).\
               Click the button below to generate a secure secret that can be used commercially. Make sure to store it somewhere safe,\
                some websites mess with UCS-2 encoding (such as Google Docs and MS Word). Make sure to try creating another Generator with\
                the secret copied from wherever you're storing it, and see if it generates the same Crypticket for the same number\
               <div></div>\
    <div tabindex='0' class='bnr-btn nibnr' onclick='longStringGenerator()'><i class='fas fa-copy'></i> Copy Random Secure Secret</div>\
    <div tabindex='1' class='bnr-btn nibnr' onclick='newGenerator(1)'><i class='fas fa-plus-circle'></i> Create Unsecure Generator</div>");

            $("#modal").modal("show");
            return;
        }

        //use btoa to encode, atob to decode

        var ticketAppend;

        try {

            ticketAppend = ";" + btoa(name) + ":" + btoa(date) + ":" + btoa(time) + ":;" + btoa(url) + ";" + btoa(x) + ":" + btoa(y) + ":;";

        } catch (e) {
            console.log(e);
            $(".modal-body").html("Looks like some of the inputs for this Generator have characters outside the UTF-8 range. Pick different characters");
            $("#modal").modal("show");

            return;
        }

        var newgenerator = { type: 1, name: name, password: password, ticketAppend: ticketAppend, curr: 1, max: parseInt(max) };

        var newgenerators = this.state.generators;
        var bail = false;

        newgenerators.map((g) => {
            if (g.name == newgenerator.name) {
                bail = true;
                $(".modal-body").html("Looks like you've already created a Generator with this name, try picking a new name");
                $("#modal").modal("show");
            }
        });

        if (bail) return;

        $(".inputs").val("").blur();

        newgenerators.unshift(newgenerator);

        storeObject("generators", newgenerators);

        newVerifier(newgenerator);

        this.setState({
            generators: newgenerators
        });
    }

    //for new password generator
    newPassGenerator(nty) {

        if (nty != undefined)
            $('#modal').modal("hide");

        var name = $("#username")[0].value.trim();
        var password = $("#global-password")[0].value.trim();

        //do validation here

        if (name == "" || password == "") {

            $(".modal-body").html("Looks like you haven't provided all the required information");
            $("#modal").modal("show");
            return;
        }

        if (password.length < 9999 && nty == undefined) {

            $(".modal-body").html("It's recommended, although not required, to use an extremely long and unique global password\
             (thousands of characters long with special and alphanumeric characters).\
             You can regenerate passwords for apps/websites by using the same global password\
            and using the same app/website name as you did when initially generating passwords for that app/website.\
            Click the button below to generate a secure global password. For recovery purposes, make sure to store it somewhere safe, \
            some websites mess with UCS-2 encoding(such as Google Docs and MS Word). Make sure to try creating another Generator with\
            the global password copied from wherever you're storing it, and see if it generates the same password for the same website/app\
               <div></div>\
    <div tabindex='0' class='bnr-btn nibnr' onclick='longStringGenerator()'><i class='fas fa-copy'></i> Copy Random Secure Password</div>\
    <div tabindex='1' class='bnr-btn nibnr' onclick='newPassGenerator(1)'><i class='fas fa-plus-circle'></i> Create Unsecure Generator</div>");

            $("#modal").modal("show");
            return;
        }

        var newgenerator = { type: 2, name: name, password: password };

        var newgenerators = this.state.generators;
        var bail = false;

        newgenerators.map((g) => {
            if (g.name == newgenerator.name) {
                bail = true;
                $(".modal-body").html("Looks like you've already created a Generator with this name, try picking a new name");
                $("#modal").modal("show");
            }
        });

        if (bail) return;

        $(".inputs").val("").blur();

        newgenerators.unshift(newgenerator);

        storeObject("generators", newgenerators);

        newUsername(name, password);

        this.setState({
            generators: newgenerators
        });
    }

    //called by child to update itself (in order to facilitate browser storage)
    removeChild(name, password, type, nty) {

        name = decodeURIComponent(name);

        if (nty != undefined)
            $("#modal").modal("hide");

        if (nty == undefined && type == 1) {

            var btn = 'window.removeChild(\''+ encodeURIComponent(name) + '\',1,' + type + ',1)';

            $(".modal-body").html("Are you sure you want to delete this Crypticket Generator?\
             The associated verifier will also be deleted, you won't be able to verify\
              Cryptickets created from this Generator anymore\
              <div></div>\
              <div tabindex='0' class='bnr-btn nibnr' onclick="+btn+"><i class='fas fa-exclamation-circle'></i> Delete</div>");

            $("#modal").modal("show");
            return;
        }

        if (nty == undefined && type == 2) {

            var btn = 'window.removeChild(\''+ encodeURIComponent(name) + '\',1,' + type + ',1)';

            $(".modal-body").html("Are you sure you want to delete this Password Generator?\
             The associated passwords in the View tab will also be deleted, \
              you'll need to recreate the same Password Generator and use the same app/website names to get back your passwords\
              <div></div>\
              <div tabindex='0' class='bnr-btn nibnr' onclick="+btn+"><i class='fas fa-exclamation-circle'></i> Delete</div>");

            $("#modal").modal("show");
            return;
        }

        $(ReactDOM.findDOMNode(this.refs[name + type])).addClass("hiding");

        setTimeout(function () {
            var generators = this.state.generators;

            var newgenerators = generators.filter(g => {
                if (g.name == name && g.type == type) {
                    return false;
                } else {
                    return true;
                }
            });

            storeObject("generators", newgenerators);

            if (type === 1)
                deleteVerifier(name);
            else
                deleteUsername(name);

            this.setState({
                generators: newgenerators
            });
        }.bind(this), 300);
    }

    //called by child to update itself (in order to facilitate browser storage)
    updateChild(name, password) {

        var generators = this.state.generators;

        var index = generators.findIndex(g => g.name == name && g.password == password);

        generators[index].curr += 1;

        storeObject("generators", generators);

        this.setState({
            generators: generators
        });
    }

    render() {

        if (this.state.generators.length == 0) {
            return null;
        }

        return e(React.Fragment, null,

            e("div",
                { className: "head-title" },
                "Generators"),

            this.state.generators.map(generator => {
                return e(Generator,
                    {
                        key: generator.name + generator.type,
                        ref: generator.name + generator.type,
                        name: generator.name,
                        type: generator.type,
                        password: generator.password,
                        curr: generator.curr,
                        max: generator.max,
                        ticketAppend: generator.ticketAppend,
                        removeChild: this.removeChild.bind(this),
                        updateChild: this.updateChild.bind(this)
                    },
                    null);
            })
        );
    }
}

$("#generators").each(function (i, ComponentContainer) {
    ReactDOM.render(
        e(Generators, null, null),
        ComponentContainer
    );
});
