import { createSignal, Show, onCleanup, onMount } from "solid-js";

export default function CountdownTimer(props) {
    const [weeksRemaining, setWeeksRemaining] = createSignal(null);
    const [daysRemaining, setDaysRemaining] = createSignal(null);
    const [hoursRemaining, setHoursRemaining] = createSignal(null);
    const [minutesRemaining, setMinutesRemaining] = createSignal(null);
    const [secondsRemaining, setSecondsRemaining] = createSignal(null);
    const [isFinished, setFinished] = createSignal(false);

    let timer = null;

    onMount(() => {
        timer = setInterval(() => {
            const targetTime = new Date(props.data.goal_time);
            updateRemaining(targetTime);
        }, 1000);
    });

    onCleanup(() => {
        clearInterval(timer);
    });

    function updateRemaining(target) {
        let now = new Date().getTime();
        target = target.getTime();
        let remaining = target - now;
        let totalSeconds = Math.round(remaining / 1000);
        if (remaining > 0) {
            let weeks = Math.floor(totalSeconds / 604800);
            let weeksSeconds = weeks * 604800;
            let days = Math.floor((totalSeconds - weeksSeconds) / 86400);
            let daysSeconds = days * 86400;
            let hours = Math.floor((totalSeconds - weeksSeconds - daysSeconds) / 3600);
            let hoursSeconds = hours * 3600;
            let minutes = Math.floor((totalSeconds - weeksSeconds - daysSeconds - hoursSeconds) / 60);
            let minutesSeconds = minutes * 60;
            let seconds = totalSeconds - weeksSeconds - daysSeconds - hoursSeconds - minutesSeconds;

            setWeeksRemaining(weeks);
            setDaysRemaining(days);
            setHoursRemaining(hours);
            setMinutesRemaining(minutes);
            setSecondsRemaining(seconds);
        } else {
            setFinished(true);
        }
    };

    return (
        <>
            <Show when={isFinished() === false}>
                <div>
                    <div>{props.data?.title}</div>
                    <div class="grid grid-flow-col gap-5 text-center auto-cols-max">
                        <div class="flex flex-col">
                            <span class="countdown font-mono text-6xl">
                                <span style={`--value:${weeksRemaining()};`}></span>
                            </span>
                            tjedana
                        </div>
                        <div class="flex flex-col">
                            <span class="countdown font-mono text-6xl">
                                <span style={`--value:${daysRemaining()};`}></span>
                            </span>
                            dana
                        </div>
                        <div class="flex flex-col">
                            <span class="countdown font-mono text-6xl">
                                <span style={`--value:${hoursRemaining()};`}></span>
                            </span>
                            sati
                        </div>
                        <div class="flex flex-col">
                            <span class="countdown font-mono text-6xl">
                                <span style={`--value:${minutesRemaining()};`}></span>
                            </span>
                            minuta
                        </div>
                        <div class="flex flex-col">
                            <span class="countdown font-mono text-6xl">
                                <span style={`--value:${secondsRemaining()};`}></span>
                            </span>
                            sekundi
                        </div>
                    </div>
                </div>
            </Show>
            <Show when={isFinished() === true}>
                <div>
                    <div>{props.data?.title}</div>
                    <div className="text-4xl">{props.data.final_message}</div>
                </div>
            </Show>
        </>
    );
}