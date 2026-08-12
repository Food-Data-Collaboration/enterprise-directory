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
        binding: string | number;
    } = $props();
</script>

<input type="radio" {id} {name} {value} bind:group={binding} />
<label for={id}>{label}kkk</label>

<style lang="scss">
    input[type="radio"] {
        border: 0;
        height: 0;
        width: 0;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        position: relative;

        & + label {
            display: inline-block;
            margin: 2px;
            padding: 5px;
            border: 1px solid gray;
            border-radius: 5px;
            cursor: pointer;
            line-height: 1rem;
        }

        &:is(input:focus-visible) {
            & + label {
                outline: 2px solid $secondary;
                outline-offset: 2px;
            }
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
