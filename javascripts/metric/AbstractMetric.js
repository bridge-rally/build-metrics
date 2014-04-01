Ext.define('metric.AbstractMetric', {

    config: {
        builds: {},
        buildDefinitions: [],
        buildUtils: null
    },

    sample: function(builds) {
        _.forEach(builds, this.doSample, this);
    },

    doSample: function(build) {
        throw new Ext.Error(this.$className + "#doSample() must be implemented!");
    },

    calculate: function() {
        throw new Ext.Error(this.$className + "#calculate() must be implemented!");
    },

    getDescription: function() {
        if (this.description) {
            return this.description;
        } else {
            throw new Ext.Error(this.$className + "#description must not be null");
        }
    },

    pluralize: function(val, num) {
        if(num != 1) { val += 's'; }
        return ' ' + num + ' ' + val;
    },

    formatDiff: function(diff) {
        var days = Math.floor(diff / (1000 * 60 * 60 * 24));
        var hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
        var minutes = Math.floor(diff / (1000 * 60)) % 60;
        var result = '';
        result += (days > 0) ? this.pluralize('day', days) + ", " : "";
        result += (hours > 0) ? this.pluralize('hour', hours) + ", " : "";
        result += (minutes > 0) ? this.pluralize('minute', minutes) : "";
        return result;
    },

    showHoursMinutesSeconds: function(diff) {
        var hours = Math.floor(diff / (1000 * 60 * 60));
        var minutes = Math.floor(diff / (1000 * 60)) % 60;
        var seconds = Math.floor(diff / 1000) % 60;
        var result = '';
        result += (hours > 0) ? this.pluralize('hour', hours) + ", " : "";
        result += (minutes > 0) ? this.pluralize('minute', minutes) : "";
        result += (seconds > 0) ? this.pluralize('second', seconds) : "";
        return result;
    },

    hasAllBuilds: function(builds) {
        return _.keys(builds).length == this.getBuildDefinitions().length;
    }

});
