Ext.define('metric.GreenTimePerDayForOneBuild', {
    extend: 'metric.AbstractMetric',

    description: 'Average daily statistics for work days 6AM to 6PM Mountain time:',

    START_HOUR: 6,
    END_HOUR: 18,

    buildArray: [],

    redTime: 0,
    greenTime: 0,

    constructor: function(config) {
        this.mergeConfig(config);
        this.callParent(arguments);
    },

    doSample: function(build) {
        this.buildArray.push(build);
    },

    calculate: function() {
        var previousBuild,
            previousBuildState,
            currentBuildState,
            diffDuringWorkHours,
            previousDate,
            workingDayCount = 0,
            analyzedBuildCount = 0;

        Ext.Array.each(this.buildArray, function(currentBuild) {
            if (!this.shouldAnalyzeBuild(currentBuild)) {
                return;
            } else {
                analyzedBuildCount++;
            }
            diffDuringWorkHours = this.getTimeDiffDuringWorkHours(currentBuild, previousBuild);
            previousBuildState = previousBuild ? this.getStatus(previousBuild) : null;
            currentBuildState = this.getStatus(currentBuild);



            var currentEndDate = new Date(this.getEndDateMillis(currentBuild)),
                previousEndDate = new Date(this.getEndDateMillis(previousBuild)),
                currentDate = new Date(util.Build.startTime(currentBuild)).getDate();

            if (!this.isSameDay(currentEndDate, previousEndDate)
                    && this.isDateAWorkingDay(currentEndDate)) {
                workingDayCount++;
            }


            if (currentBuildState !== previousBuildState) {
                if (currentBuildState === 'SUCCESS') {
                    this.redTime += diffDuringWorkHours;
                } else if (previousBuildState === 'SUCCESS') { //don't count non-green colors
                    this.greenTime += diffDuringWorkHours;
                } else {
                }
            } else if (currentBuildState === 'SUCCESS') {
                this.greenTime += diffDuringWorkHours;
            }
            else {
                this.redTime += diffDuringWorkHours;
            }

            previousBuild = currentBuild;
            previousDate = currentDate;
            }, this
        );

        var countingToday = new Date().getHours() < this.END_HOUR ? "(Not counting today)" : "",
            totalTime = this.greenTime + this.redTime;


        return "<b>Average per working day</b> " + countingToday + "<br/>"
                + "Green light: " + this.showHoursMinutesSeconds(this.greenTime/workingDayCount) + " - " + this.greenTime/totalTime * 100 + "%<br/>"
                + "Red light: " + this.showHoursMinutesSeconds(this.redTime/workingDayCount) + " - " + this.redTime/totalTime * 100 +  "%<br/>"
                + "<b>Total data</b>:<br/>"
                + "Number of builds: " + analyzedBuildCount + "<br/>"
                + "Number of working days: " + workingDayCount + "<br/>"
                + "Green light time: " + this.showHoursMinutesSeconds(this.greenTime) + "<br/>"
                + "Red light time: " + this.showHoursMinutesSeconds(this.redTime) + "<br/>";
    },


    getTimeDiffDuringWorkHours: function(currentBuild, previousBuild) {
        var currentBuildEndDateMillis = this.getEndDateMillis(currentBuild),
            previousBuildEndDateMillis;

        //first build, we can't determine so throw it out
        if (!previousBuild) {
            return 0;
        }

        previousBuildEndDateMillis = this.getEndDateMillis(previousBuild);

        //working hours
        if (this.isSpanDuringWorkingHours(currentBuildEndDateMillis, previousBuildEndDateMillis)) {
            return currentBuildEndDateMillis - previousBuildEndDateMillis;
        }

        //span straddles working hours
        if (!this.isSameDay(currentBuildEndDateMillis, previousBuildEndDateMillis)) {
            return this.handleMultiDaySpan(currentBuild, previousBuild);
        }
        if (!this.isTimeWithinWorkingHours(previousBuildEndDateMillis) && this.isTimeWithinWorkingHours(currentBuildEndDateMillis)) {
            return currentBuildEndDateMillis  - this.getWorkingDayStartInMillis(currentBuild);
        } else if (this.isTimeWithinWorkingHours(previousBuildEndDateMillis) && !this.isTimeWithinWorkingHours(currentBuildEndDateMillis)) {
            return this.getWorkingDayEndInMillis(currentBuild) - previousBuildEndDateMillis;
        } else {
            return 0;  //outside working hours
        }
    },

    handleMultiDaySpan: function(currentBuild, previousBuild) {
        var total = 0,
            previousBuildEndDateMillis = this.getEndDateMillis(previousBuild),
            currentBuildEndDateMillis = this.getEndDateMillis(currentBuild);

        if (this.isTimeWithinWorkingHours(previousBuildEndDateMillis)) {
            total += this.getWorkingDayEndInMillis(previousBuild) - previousBuildEndDateMillis;
        }
        if (this.isTimeWithinWorkingHours(currentBuildEndDateMillis)) {
            total += currentBuildEndDateMillis - this.getWorkingDayStartInMillis(currentBuild);
        }
        return total;
    },

    isSpanDuringWorkingHours: function(currentBuildEndDateMillis, previousBuildEndDateMillis) {
        if (this.isSameDay(currentBuildEndDateMillis, previousBuildEndDateMillis)
                && this.isTimeWithinWorkingHours(currentBuildEndDateMillis)
                && this.isTimeWithinWorkingHours(previousBuildEndDateMillis)) {
            return true;
        }

        return false;
    },

    isSameDay: function(date1Millis, date2Millis) {
        var date1 = new Date(date1Millis),
            date2 = new Date(date2Millis);

        return date1.getYear() === date2.getYear()
                && date1.getMonth() === date2.getMonth()
                && date1.getDate() === date2.getDate();
    },

    isTimeWithinWorkingHours: function(dateMillis) {
        var date = new Date(dateMillis),
            hour = date.getHours();

        if (this.isDateAWorkingDay(date)) //during weekday
	        // 6:00 AM to 5:59:59 PM
	        return hour >= this.START_HOUR && hour < this.END_HOUR;

	 	return false;
    },

    isDateAWorkingDay: function(date) {
        var day = date.getDay();
        return [1,2,3,4,5].indexOf(day) !== -1;
    },

    getWorkingDayStartInMillis: function(build) {
        var date = new moment(util.Build.startTime(build));
        date.hour(this.START_HOUR);
        date.minute(0);
        date.second(0);

        return date.toDate().getTime();
    },

    getWorkingDayEndInMillis: function(build) {
        var date = new moment(util.Build.startTime(build));
        date.hour(this.END_HOUR);
        date.minute(0);
        date.second(0);

        return date.toDate().getTime();
    },

    getEndDateMillis: function(build) {
        if (build) {
            return util.Build.endTime(build);
        }
    },

    getStatus: function(build) {
        if (build) {
            var state = build.get('Status');
            if (state === 'SUCCESS') {
                return 'SUCCESS';
            }
            return 'FAILING';
        }
    },

    /**
     * Don't analyze build if build is on the same day as today and today is not yet done.
     * @param currentBuild
     * @return {boolean}
     */
    shouldAnalyzeBuild: function(currentBuild) {
        var now = new Date(),
            currentHour = now.getHours();

        return !this.isSameDay(now.getTime(), util.Build.startTime(currentBuild))
                || currentHour >= this.END_HOUR;
    }
});
