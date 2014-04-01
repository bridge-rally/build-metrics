Ext.define('util.Build', {
    singleton: true,

    buildDefinitionNameFor: function(build) {
        return build.get('BuildDefinition')._refObjectName;
    },

    startTime: function(build) {
        var buildTime = Date.parse(build.get('Start')),
            timeZoneOffset = new Date().getTimezoneOffset() * 60 * 1000,
            correctedTime = buildTime + timeZoneOffset;
        return correctedTime;
    },

    endTime: function(build) {
        return this.startTime(build) + (build.get('Duration') * 1000);
    },

    isPassing: function(build) {
        return build && build.get('Status') === 'SUCCESS';
    },

    isFailing: function(build) {
        return !this.isPassing(build);
    },

    allPassing: function(builds) {
        return _.all(builds, this.isPassing);
    }
});
