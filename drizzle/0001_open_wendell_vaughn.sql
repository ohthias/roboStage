ALTER TABLE "lab_test_calibration_details" ADD COLUMN "measurements" jsonb;--> statement-breakpoint
ALTER TABLE "lab_test_calibration_details" DROP COLUMN "robot_model";--> statement-breakpoint
ALTER TABLE "lab_test_calibration_details" DROP COLUMN "firmware";--> statement-breakpoint
ALTER TABLE "lab_test_calibration_details" DROP COLUMN "battery_used";--> statement-breakpoint
ALTER TABLE "lab_test_calibration_details" DROP COLUMN "sensor_used";--> statement-breakpoint
ALTER TABLE "lab_test_calibration_details" DROP COLUMN "motor_used";--> statement-breakpoint
ALTER TABLE "lab_test_calibration_details" DROP COLUMN "port_used";--> statement-breakpoint
ALTER TABLE "lab_test_calibration_details" DROP COLUMN "ideal_value_found";--> statement-breakpoint
ALTER TABLE "lab_test_calibration_details" DROP COLUMN "configuration_used";