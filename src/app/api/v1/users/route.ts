import UserService from "@/server/services/UserService";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const user = await UserService.create(body);
        return Response.json({ user });
    } catch (error) {
        console.log(error);

        return Response.json({ error: "Internal server error" }, { status: 500 });
    }
};