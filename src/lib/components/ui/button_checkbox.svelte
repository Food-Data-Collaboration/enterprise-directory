<script lang="ts">
    let {
        id,
        name,
        value,
        label,
        binding = $bindable(),
    }: {
        id: string;
        name: string;
        value: string | number;
        label: string;
        binding: string[];
    } = $props();
</script>

<input type="checkbox" {id} {name} {value} bind:group={binding} />
<label for={id}>{label} </label>

<style lang="scss">
    input[type="checkbox"] {
        border: 0;
        clip: rect(0 0 0 0);
        height: 1px;
        margin: -1px;
        overflow: hidden;
        padding: 0;
        position: relative;
        width: 1px;

        & + label {
            display: inline-block;
            margin: 2px;
            padding: 5px;
            border: 1px solid gray;
            border-radius: 5px;
            cursor: pointer;
            line-height: 1rem;
        }

        &:is(input:checked) {
            & + label {
                background-color: #3584e4;
                border-color: #2a7bd7;
                color: white;
            }
        }
    }
</style>
