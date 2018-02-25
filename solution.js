{
    init(elevators, floors) {
        let q = []; 
        
        const floorUpDownButtonPressed = (floorNum, direction) => {
            console.group(`floor ${floorNum}: ${direction} button pressed`);
            addFloorToGlobalQ(floorNum, direction);
            console.groupEnd();
        };
                   
        const elevatorIdle = (elevator, index) => {
            console.group(`elevator ${index}: idle`);
            let nextFloor = 0;
            if (q.length) {
                nextFloor = q.shift().floorNum;
                console.log(`going to next floor ${nextFloor} from global q`, JSON.stringify(q));
            } else {
                console.log(`global q empty, going to floor ${nextFloor}`);
            }
            addFloorToEndOfElevatorQ(elevator, nextFloor);
            console.groupEnd();
        };
        
        const elevatorFloorButtonPressed = (elevator, index, floorNum) => {
            console.group(`elevator ${index}: floor button pressed`);
            addFloorToEndOfElevatorQ(elevator, floorNum);
            console.groupEnd();
        };
        
        const elevatorPassingFloor = (elevator, index, floorNum, direction) => {
            console.group(`elevator ${index}: passing floor ${floorNum} while going ${direction}`);
            if (elevator.destinationQueue.includes(floorNum) || hasSpace(elevator, index) && removeFloorFromGlobalQ(floorNum, direction)) {
                addFloorToStartOfElevatorQ(elevator, floorNum);
            }
            console.groupEnd();
        };
        
        const elevatorStoppedAtFloor = (elevator, index, floorNum) => {
            console.group(`elevator ${index}: stopped at floor ${floorNum}`);
            updateIndicators(elevator, floorNum);
            hasSpace(elevator, index);
            console.log(`current q`, JSON.stringify(elevator.destinationQueue));
            console.groupEnd();
        };
        
        const isFloorInGlobalQ = (floorNum, direction) => q.findIndex(entry => entry.floorNum === floorNum && entry.direction === direction) >= 0;
        
        const addFloorToGlobalQ = (floorNum, direction) => {
            if (isFloorInGlobalQ(floorNum, direction)) {
                console.log(`floor ${floorNum} going ${direction} is already in global q`, JSON.stringify(q));
                return;
            }
            q.push({floorNum: floorNum, direction: direction});
            console.log(`added floor ${floorNum} going ${direction} to end of global q`, JSON.stringify(q));
        }
        
        const removeFloorFromGlobalQ = (floorNum, direction) => {
            if (isFloorInGlobalQ(floorNum, direction)) {
                q = q.filter(entry => entry.floorNum !== floorNum || entry.direction !== direction);
                console.log(`removed floor ${floorNum} going ${direction} from global q`, JSON.stringify(q));
                return true;
            } else {
                console.log(`floor ${floorNum} going ${direction} not in global q`, JSON.stringify(q));
                return false;
            }
        }
        
        const addFloorToStartOfElevatorQ = (elevator, floorNum) => {
            elevator.goToFloor(floorNum, true);
            console.log(`added floor ${floorNum} to start of elevator q`, JSON.stringify(elevator.destinationQueue));
            if (elevator.destinationQueue.includes(floorNum, 1)) {
                elevator.destinationQueue.splice(elevator.destinationQueue.indexOf(floorNum, 1), 1);
                elevator.checkDestinationQueue();
                console.log(`removed floor ${floorNum} from the elevator q`, JSON.stringify(elevator.destinationQueue));
            }
        };
        
        const addFloorToEndOfElevatorQ = (elevator, floorNum) => {
            if (elevator.destinationQueue.includes(floorNum)) {
                console.log(`floor ${floorNum} is already in elevator q`, JSON.stringify(elevator.destinationQueue));
                return;
            }
            elevator.goToFloor(floorNum);
            console.log(`added floor ${floorNum} to end of elevator q`, JSON.stringify(elevator.destinationQueue));
        };
        
        const hasSpace = (elevator, index) => { 
            const maxPassengers  = elevator.maxPassengerCount() - 3,
                  passengerCount = Math.ceil(elevator.loadFactor() * maxPassengers * 1.2),
                  hasSpace       = passengerCount < maxPassengers;
            console.log(`elevator ${index} probably has ${passengerCount}/${maxPassengers} passengers and ${
                         hasSpace ? 'still has' : 'does not have'} space left`);
            return hasSpace;
        }
        
        const updateIndicators = (elevator, floorNum) => {
            let direction = 0
            if (elevator.destinationQueue[0] !== undefined) {
                direction = Math.min(1, Math.max(-1, elevator.destinationQueue[0] - floorNum));
            }
                      
            switch (direction) {
                case 1: 
                    elevator.goingUpIndicator(true);
                    elevator.goingDownIndicator(false);
                    break;
                case -1: 
                    elevator.goingUpIndicator(false);
                    elevator.goingDownIndicator(true);
                    break;
                case 0: 
                    elevator.goingUpIndicator(floorNum < floors.length - 1);
                    elevator.goingDownIndicator(floorNum > 0);
                    break;
            }
        };
        
        floors.forEach(floor => {
            floor.on("up_button_pressed",   floors => floorUpDownButtonPressed(floor.floorNum(), 'up'));
            floor.on("down_button_pressed", floors => floorUpDownButtonPressed(floor.floorNum(), 'down'));
        });
        
        elevators.forEach((elevator, index) => {
            elevator.on("idle",                                   () => elevatorIdle              (elevator, index                     ));
            elevator.on("floor_button_pressed", floorNum             => elevatorFloorButtonPressed(elevator, index, floorNum           ));
            elevator.on("passing_floor",       (floorNum, direction) => elevatorPassingFloor      (elevator, index, floorNum, direction));
            elevator.on("stopped_at_floor",     floorNum             => elevatorStoppedAtFloor    (elevator, index, floorNum           ));
        });
        
        console.clear();
    },
    update(dt, elevators, floors) {}
}
