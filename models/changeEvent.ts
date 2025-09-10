export class ChangeEvent {
	changedBy: string;
	timestamp: Date;
	what: string;
	oldValue: any;
	newValue: any;

	constructor(
		changedBy: string,
		timestamp: Date,
		what: string,
		oldValue: any,
		newValue: any
	) {
		this.changedBy = changedBy;
		this.timestamp = timestamp;
		this.what = what;
		this.oldValue = oldValue;
		this.newValue = newValue;
	}
}