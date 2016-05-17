String.prototype.firstLetterToLowerCase = function() {
    var s = this.trim();
    return s.length <= 1 ? s.toLowerCase() : s.charAt(0).toLowerCase() + s.slice(1);
};

function correctModel(inputId, outputId, packageId, radioName) {
    var input = document.getElementById(inputId).value;
    var output = input.substr(input.indexOf("package"));
    var type = getRadioValueAsInt(radioName);
    output = output.replace(/^package\s[^;]+;/, "package " + document.getElementById(packageId).value + ";\n\nimport net.minecraft.client.model.ModelBase;\nimport net.minecraft.client.model.ModelRenderer;" + (type == 0 ? "\nimport net.minecraft.entity.Entity;" : ""));
    output = output.replace(/\s*\/\/(.*)/g, "");
    var fields = [];
    output = output.replace(/(\s+)ModelRenderer\s([^;]+)/g, function(match, spaces, name, offset, string) {
        fields.push(name);
        return spaces + "public ModelRenderer " + name.firstLetterToLowerCase();
    });
    for (i in fields) {
        var fieldRegexp = new RegExp("(\\W)" + fields[i] + "(?!(;|\\w))", "g");
        var output = output.replace(fieldRegexp, "$1this." + fields[i].firstLetterToLowerCase());
    }
    output = output.replace(/texture(Width|Height)/g, "  this.texture$1");
    output = output.replace(/(setRotation\(this\.\w+(,\s-?\d+(\.\d+)?F){3}\);)(?!\s*\})/g, "$1\n");
    output = output.replace(/(this\.\w+\s?=\s?new\sModelRenderer\(this(?:,\s?\d+){2}\);)((?:[^;]+;){3})(\s*)this\.(\w+)\.mirror\s?=\s?(true|false);/gm, "$1$3this.$4.mirror = $5;$2");
    output = output.replace(/private\svoid\ssetRotation/, "public static void setRotation");
    output = output.replace(/\s*public\svoid\ssetRotationAngles\([^)]+\)\s*\{[^}]+\}\s*/m, "\n");
    if (type == 1) {
        output = output.replace(/public\svoid\srender\([^)]*\)(\s*)\{(?:\s*[^;]+;){2}/, "public void renderAll()$1{");
        output = output.replace(/this\.(\w+).render\(f5\);/g, "this.$1.render(0.0625F);");
    } else {
        output = output.replace(/setRotationAngles\(([^)]+)\)/, "setRotationAngles($1, entity)");
    }
    document.getElementById(outputId).value = output;
}

function getRadioValueAsInt(name) {
    var r = document.getElementsByName(name);
    for (var i = 0; i < r.length; i++) {
        if (r[i].checked) return parseInt(r[i].value);
    }
}